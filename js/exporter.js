/**
 * Export the current Three.js canvas as a PNG file download.
 * Renderer must be created with preserveDrawingBuffer: true.
 */
export function exportPNG(renderer, scene, camera, filename = 'my-aquarium.png') {
  // Force a fresh render
  renderer.render(scene, camera);

  const dataURL = renderer.domElement.toDataURL('image/png');
  const a = document.createElement('a');
  a.href = dataURL;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

/**
 * Share: tries Web Share API (mobile), falls back to clipboard copy of dataURL,
 * then falls back to download.
 */
export async function shareAquarium(renderer, scene, camera, showToast) {
  renderer.render(scene, camera);
  const dataURL = renderer.domElement.toDataURL('image/png');

  // Try Web Share API with a Blob
  if (navigator.canShare) {
    try {
      const response = await fetch(dataURL);
      const blob = await response.blob();
      const file = new File([blob], 'my-aquarium.png', { type: 'image/png' });
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: '🐠 My Aquarium',
          text: 'Check out the aquarium I designed!',
          files: [file],
        });
        showToast('Aquarium shared! 🐠');
        return;
      }
    } catch (err) {
      // Fall through
    }
  }

  // Try clipboard
  try {
    const response = await fetch(dataURL);
    const blob = await response.blob();
    await navigator.clipboard.write([
      new ClipboardItem({ 'image/png': blob }),
    ]);
    showToast('Image copied to clipboard! Paste to share 📋');
    return;
  } catch (_) {
    // Fall through to download
  }

  // Final fallback: just download
  exportPNG(renderer, scene, camera);
  showToast('PNG downloaded! Share it with friends 🐟');
}
