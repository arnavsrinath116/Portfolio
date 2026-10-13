#!/bin/zsh
# Export a Fusion design to a web model for the Fusion skill card.
#   tools/fusion/export-model.sh <name> <fusion file id> [triangle budget]
# Needs Fusion running with Preferences > General > API > Fusion MCP Server on (port 27182),
# and Blender at /Applications/Blender.app. Writes public/models/<name>.glb.
set -e
here=${0:A:h}
name=$1; id=$2; budget=${3:-120000}
tmp=$(mktemp -d)
node "$here/fmcp.mjs" tools/call "{\"name\":\"fusion_mcp_execute\",\"arguments\":{\"featureType\":\"document\",\"object\":{\"operation\":\"open\",\"fileId\":\"$id\"}}}" > /dev/null
sleep 4
node "$here/fexec.mjs" "$here/export_visible.py" ro "OUT=$tmp/$name" "REF=MeshRefinementMedium"
/Applications/Blender.app/Contents/MacOS/Blender -b --factory-startup -P "$here/bl_process.py" -- \
  "$tmp/$name" "$here/../../public/models/$name.glb" "$budget" "$tmp/$name-check.png" | grep -E "^(parts|tris|bbox|glb)"
echo "check render: $tmp/$name-check.png"
