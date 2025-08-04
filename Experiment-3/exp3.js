const toggleBtn = document.getElementById('theme-toggle');
toggleBtn.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  toggleBtn.textContent = document.body.classList.contains('dark') 
    ? '☀️ Light Mode' 
    : '🌙 Dark Mode';
});
