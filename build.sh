#!/bin/bash
# Merakit src/ menjadi satu berkas index.html. Jalankan hanya bila mengubah isi src/.
set -e
cd "$(dirname "$0")"
JS=$(cat src/data.js src/ui.js src/views1.js src/views2.js src/views3.js src/actions.js)
{
  echo '<!doctype html><html lang="id"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">'
  echo '<title>E-Logbook Profesi Dokter UMT</title>'
  echo '<meta name="description" content="E-logbook dan e-portofolio Program Studi Profesi Dokter Universitas Murni Teguh">'
  echo '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>'
  echo '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap">'
  echo '<style>'; cat src/style.css; echo '</style></head><body>'
  echo '<div id="app"></div><div id="modal" hidden></div><div id="toast" class="toast" hidden></div>'
  echo '<script src="https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js"></script>'
  echo '<script>'; echo "$JS"; echo '</script></body></html>'
} > index.html
echo "index.html dibuat"
