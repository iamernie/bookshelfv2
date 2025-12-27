#!/bin/sh
# BookShelf V2 Docker Entrypoint
# Handles PUID/PGID for proper file ownership

set -e

# Default to UID/GID 1000 if not specified
PUID=${PUID:-1000}
PGID=${PGID:-1000}

echo "Starting BookShelf V2 with UID: $PUID, GID: $PGID"

# Find or create a group with the target GID
EXISTING_GROUP=$(getent group "$PGID" | cut -d: -f1 || true)

if [ -n "$EXISTING_GROUP" ]; then
    # Use existing group with this GID
    TARGET_GROUP="$EXISTING_GROUP"
    echo "Using existing group '$TARGET_GROUP' with GID $PGID"
else
    # Create new group
    TARGET_GROUP="bookshelf"
    addgroup -g "$PGID" "$TARGET_GROUP"
    echo "Created group '$TARGET_GROUP' with GID $PGID"
fi

# Find or create a user with the target UID
EXISTING_USER=$(getent passwd "$PUID" | cut -d: -f1 || true)

if [ -n "$EXISTING_USER" ]; then
    # Use existing user with this UID
    TARGET_USER="$EXISTING_USER"
    echo "Using existing user '$TARGET_USER' with UID $PUID"
else
    # Create new user
    TARGET_USER="bookshelf"
    adduser -D -u "$PUID" -G "$TARGET_GROUP" -h /app -s /bin/sh "$TARGET_USER" 2>/dev/null || true
    echo "Created user '$TARGET_USER' with UID $PUID"
fi

# Set ownership on data directories
echo "Setting ownership on data directories..."
chown -R "$PUID:$PGID" /data /logs /app/static/covers /app/static/ebooks 2>/dev/null || true

# Also ensure the app directory is accessible
chown "$PUID:$PGID" /app 2>/dev/null || true

# Run the SvelteKit application as the target user
echo "Starting SvelteKit application..."
exec su-exec "$PUID:$PGID" node build
