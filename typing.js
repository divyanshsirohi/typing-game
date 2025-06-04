const words='Beneath the crimson sky, a solitary traveler wandered through the labyrinthine streets of an ancient city, his footsteps echoing against cobblestone paths. Lanterns swayed in the wind, casting flickering shadows that danced like phantoms on the weathered walls. With a heart full of curiosity and a pocketful of forgotten maps, he chased the whispers of a mythical melody, rumored to lead to a hidden garden where chrysanthemums bloom beneath a silvery moon. Time felt elastic, and reality blurred into a kaleidoscope of memory and dream'.split(' ');
const wordsCount=words.length;

function addClass(el, name){
  el.className+=' '+name;
}

function removeClass(el, name){
  el.className =el.className.replace(name,'');
  
}

function randomWord(){
  const randomIndex = Math.floor(Math.random()*wordsCount);
  return words[randomIndex];
}

function formatWord(word){
  return `<div class="word"><span class="letter">${word.split('').join('</span><span class="letter">')}</span></div>`;
}

function newGame(){
  document.getElementById('words').innerHTML = '';
  for(let i=0;i<200;i++){
    document.getElementById('words').innerHTML+=formatWord(randomWord());
  }

  addClass(document.querySelector('.word'), 'current');
  addClass(document.querySelector('.letter'),'current');
}

document.getElementById('game').addEventListener('keyup', ev=>{
  const key=ev.key;
  const currentWord=document.querySelector('.word.current');
  const currentLetter= document.querySelector('.letter.current');
  const expectedKey = currentLetter?.innerHTML || ' ';
  const isLetter = key.length === 1 && key!== ' ';
  const isSpace = key===' ';
  console.log({key, expectedKey});

  if(isLetter){
    if(currentLetter){
      addClass(currentLetter,key===expectedKey?'correct':'incorrect');
      removeClass(currentLetter,'current');
      addClass(currentLetter.nextSibling,'current');
    }
  }

  if(isSpace){
    if(expectedKey!==' '){
      const lettersToInvalidate = [...document.querySelectorAll('.word.current .letter:not(.correct)')];
      lettersToInvalidate.forEach(letter => {
        addClass(letter, 'incorrect'); 
      });

      removeClass(currentWord,'current');
      addClass(currentWord.nextSibling,'current');
      if (currentLetter) {
        removeClass(currentLetter, 'current');
      }
      addClass(currentWord.nextSibling.firstChild, 'current');
    }
  }
})

newGame();
