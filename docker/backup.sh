#!/bin/sh
# LDB-DataGuard Database Backup Script
# Runs daily via cron, maintains 30-day retention

set -e

# Configuration
BACKUP_DIR="/backups"
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-30}"
DATE=$(date +%Y-%m-%d_%H-%M-%S)
BACKUP_FILE="${BACKUP_DIR}/ldb_dataguard_${DATE}.sql.gz"

# Ensure backup directory exists
mkdir -p "${BACKUP_DIR}"

# Create backup
echo "[$(date)] Starting backup..."
pg_dump -h "${PGHOST:-db}" -U "${PGUSER:-ldb}" -d "${PGDATABASE:-ldb_dataguard}" | gzip > "${BACKUP_FILE}"

# Check if backup was successful
if [ $? -eq 0 ] && [ -f "${BACKUP_FILE}" ]; then
    BACKUP_SIZE=$(du -h "${BACKUP_FILE}" | cut -f1)
    echo "[$(date)] Backup completed successfully: ${BACKUP_FILE} (${BACKUP_SIZE})"
else
    echo "[$(date)] Backup failed!"
    exit 1
fi

# Remove old backups
echo "[$(date)] Cleaning up backups older than ${RETENTION_DAYS} days..."
find "${BACKUP_DIR}" -name "ldb_dataguard_*.sql.gz" -type f -mtime +${RETENTION_DAYS} -delete

# List remaining backups
BACKUP_COUNT=$(ls -1 "${BACKUP_DIR}"/ldb_dataguard_*.sql.gz 2>/dev/null | wc -l)
echo "[$(date)] Total backups: ${BACKUP_COUNT}"

# Calculate total backup size
TOTAL_SIZE=$(du -sh "${BACKUP_DIR}" | cut -f1)
echo "[$(date)] Total backup storage: ${TOTAL_SIZE}"

echo "[$(date)] Backup process completed."
