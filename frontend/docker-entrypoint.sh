#!/bin/sh
# Replace the environment variable in the built JavaScript files
find /usr/share/nginx/html -type f -name "*.js" -exec sed -i "s/import.meta.env.VITE_GOOGLE_MAPS_API_KEY/\"$VITE_GOOGLE_MAPS_API_KEY\"/g" {} \;

# Start Nginx
exec "$@"