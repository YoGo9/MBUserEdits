#!/usr/bin/env bash
# setup.sh — set up Brainz Edit Pulse locally on Ubuntu/WSL
# Run once: bash setup.sh

set -euo pipefail

GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'
info()  { echo -e "${GREEN}[setup]${NC} $*"; }
warn()  { echo -e "${YELLOW}[setup]${NC} $*"; }
error() { echo -e "${RED}[setup]${NC} $*"; exit 1; }

# ── 1. Node.js ────────────────────────────────────────────────────────────────
info "Checking Node.js..."
if ! command -v node &>/dev/null || [[ $(node -e 'process.exit(parseInt(process.version.slice(1)))' 2>/dev/null; echo $?) -ne 0 ]]; then
  NODE_MAJOR=$(node -e 'console.log(parseInt(process.version.slice(1)))' 2>/dev/null || echo 0)
  if [[ "$NODE_MAJOR" -lt 18 ]]; then
    info "Installing Node.js 20 via NodeSource..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo bash -
    sudo apt-get install -y nodejs
  fi
fi
info "Node.js $(node --version) ✓"

# ── 2. PostgreSQL ─────────────────────────────────────────────────────────────
info "Checking PostgreSQL..."
if ! command -v psql &>/dev/null; then
  info "Installing PostgreSQL..."
  sudo apt-get update -qq
  sudo apt-get install -y postgresql postgresql-contrib
fi
info "PostgreSQL $(psql --version | awk '{print $3}') ✓"

# Start PostgreSQL (WSL doesn't auto-start services)
if ! pg_isready -q 2>/dev/null; then
  info "Starting PostgreSQL..."
  sudo service postgresql start
  sleep 2
fi

# ── 3. Create DB user and database ───────────────────────────────────────────
info "Setting up database..."

DB_USER="brainz"
DB_NAME="brainz_edit_pulse"
DB_PASS="brainzpulse_$(openssl rand -hex 6)"

# Check if user already exists
USER_EXISTS=$(sudo -u postgres psql -tAc "SELECT 1 FROM pg_roles WHERE rolname='$DB_USER'" 2>/dev/null || echo "")

if [[ -z "$USER_EXISTS" ]]; then
  info "Creating PostgreSQL user '$DB_USER'..."
  sudo -u postgres psql -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASS';"
else
  warn "User '$DB_USER' already exists — reusing. You may need to check the password in your .env."
  DB_PASS="<your existing password>"
fi

# Check if DB already exists
DB_EXISTS=$(sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'" 2>/dev/null || echo "")
if [[ -z "$DB_EXISTS" ]]; then
  info "Creating database '$DB_NAME'..."
  sudo -u postgres psql -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;"
else
  warn "Database '$DB_NAME' already exists — skipping creation."
fi

sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;" 2>/dev/null || true

# ── 4. Write .env ─────────────────────────────────────────────────────────────
if [[ -f .env ]]; then
  warn ".env already exists — skipping. Edit it manually if needed."
else
  info "Writing .env..."
  read -rp "  Your MusicBrainz username: " MB_USERNAME
  read -rp "  Scrape interval cron (default: */5 * * * *): " SCRAPE_CRON
  SCRAPE_CRON="${SCRAPE_CRON:-*/5 * * * *}"

  cat > .env <<EOF
MB_USERNAME=$MB_USERNAME
SCRAPE_CRON=$SCRAPE_CRON

PGHOST=localhost
PGPORT=5432
PGDATABASE=$DB_NAME
PGUSER=$DB_USER
PGPASSWORD=$DB_PASS

PORT=3456
BASE_PATH=/
NODE_ENV=development
EOF
  info ".env written ✓"
fi

# ── 5. npm install ────────────────────────────────────────────────────────────
info "Installing Node dependencies..."
npm install

# ── 6. Run migrations ─────────────────────────────────────────────────────────
info "Running database migrations..."
npm run setup-db

# ── Done ──────────────────────────────────────────────────────────────────────
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}  Brainz Edit Pulse is ready!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "  Start the server:   npm start"
echo "  Dev mode (watch):   npm run dev"
echo "  One-off scrape:     npm run scrape"
echo ""
echo "  Frontend: build the React app in ../frontend/ then"
echo "  it will be served automatically at http://localhost:3456"
echo ""
warn "NOTE: On WSL you need to start PostgreSQL manually after each reboot:"
warn "  sudo service postgresql start"
echo ""
