// Tiny helper: clears the local persistence. Since storage is localStorage,
// the most reliable reset is "Reset" in-app. This script just prints instructions
// and removes any stray .cache next to the project.
console.log("To reset game state:");
console.log("  1. Open the running app in the browser");
console.log("  2. Open DevTools > Application > Local Storage");
console.log("  3. Remove key  duskkeep-fronts:player:v1");
console.log("");
console.log("Or visit /?reset=1 (not yet implemented) or call useGameStore.getState().resetAll() from the console.");
