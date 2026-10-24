#!/bin/sh
# After build_room.py exports public/room/room.glb (JPEG bakes), shrink it for the web:
# the baked textures become WebP (q85), then the geometry is Draco-compressed again.
# 1.09 MB -> ~475 KB. three.js reads EXT_texture_webp natively.
set -e
GLB="$(dirname "$0")/../../public/room/room.glb"
TMP="$(mktemp -d)"
npx -y @gltf-transform/cli@4.1.1 webp "$GLB" "$TMP/webp.glb" --quality 85
npx -y @gltf-transform/cli@4.1.1 draco "$TMP/webp.glb" "$GLB"
rm -rf "$TMP"
ls -la "$GLB"
