// === Generate random sparkles ===
function createSparkles(count=30) {
  for(let i=0;i<count;i++){
    const sparkle = document.createElement('div');
    sparkle.classList.add('sparkle');
    sparkle.style.top = Math.random()*window.innerHeight + 'px';
    sparkle.style.left = Math.random()*window.innerWidth + 'px';
    sparkle.style.animationDuration = (2 + Math.random()*3) + 's';
    document.body.appendChild(sparkle);
  }
}
window.onload = () => {
  createSparkles();
}