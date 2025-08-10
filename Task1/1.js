
// Filtering
const filterBtns = document.querySelectorAll('.filter-buttons button');
const tiles = document.querySelectorAll('.tile');
filterBtns.forEach(btn=>{
  btn.addEventListener('click',()=>{
    filterBtns.forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.dataset.filter;
    tiles.forEach(tile=>{
      if(filter==='all' || tile.dataset.category===filter){
        tile.style.display='block';
        tile.style.opacity='1';
        tile.style.transform='scale(1)';
      }else{
        tile.style.opacity='0';
        tile.style.transform='scale(0.8)';
        setTimeout(()=>tile.style.display='none',300);
      }
    });
  });
});

// Lightbox
const tileImgs = document.querySelectorAll('.tile img');
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
const closeBtn = document.getElementById('closeBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
let currentIndex=0;

function openLightbox(index){
  currentIndex=index;
  lightboxImg.src=tileImgs[index].src;
  lightbox.classList.add('open');
}
function closeLightbox(){lightbox.classList.remove('open');}
function showNext(){
  currentIndex=(currentIndex+1)%tileImgs.length;
  lightboxImg.src=tileImgs[currentIndex].src;
}
function showPrev(){
  currentIndex=(currentIndex-1+tileImgs.length)%tileImgs.length;
  lightboxImg.src=tileImgs[currentIndex].src;
}

tileImgs.forEach((img,i)=>img.addEventListener('click',()=>openLightbox(i)));
closeBtn.addEventListener('click',closeLightbox);
nextBtn.addEventListener('click',showNext);
prevBtn.addEventListener('click',showPrev);
lightbox.addEventListener('click',e=>{if(e.target===lightbox)closeLightbox();});
document.addEventListener('keydown',e=>{
  if(!lightbox.classList.contains('open'))return;
  if(e.key==='ArrowRight')showNext();
  if(e.key==='ArrowLeft')showPrev();
  if(e.key==='Escape')closeLightbox();
});
