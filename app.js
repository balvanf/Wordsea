/* NOTES:
• occasional slow fetch, added button to prevent user checking before succesfull fetch 
• fetched words are not filtered so some results are uncommon
• "Not in word list" check is not implemented as it would take too long for the API to process verification

*/

const keys = [
  "Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P", 
    "A", "S", "D", "F", "G", "H", "J", "K", "L", 
  "ENTER", "Z", "X", "C", "V", "B", "N", "M", "DELETE" 
]
const keyboard = document.getElementById('keyboard')
const container = document.getElementById('container')
const blur = document.getElementById('blur')
const modalWinner = document.getElementById('modal-winner')
const notification = document.getElementById('notification')
const letterContainer = document.getElementById('letter-container')
const showBtn = document.getElementById('show-btn')

let hiddenWord = []
let userWord = []
let rowCount = 0
let letterCount = 0

// // GET A 5 LETTER WORD

const fetchWord = function () {
  showBtn.innerText = `Please wait. Fetching the word ...`
  fetch("https://random-words-api.vercel.app/word")
  .then(res => res.json())
  .then(data => {
    if (data[0].word.length === 5) {
      hiddenWord = Array.from(data[0].word.toUpperCase())
      showBtn.innerText = "Show solution"
      showBtn.addEventListener('click', () => {
        showBtn.innerText = hiddenWord.join('')
      })
        } else {
          fetchWord()
        }
      })
    .catch(err => {
      showBtn.innerHTML = err + `<br> Please refresh`
    }) 
}

fetchWord()


// RENDER LETTER BOXES ON PAGE LOAD

for (let i = 0; i < 5; i++) {
  letterContainer.innerHTML += `
    <div id="letter-row-${i}" class="letter-row">
      <div id="${i}-0" class="letter-box"></div>
      <div id="${i}-1" class="letter-box"></div>
      <div id="${i}-2" class="letter-box"></div>
      <div id="${i}-3" class="letter-box"></div>
      <div id="${i}-4" class="letter-box"></div>
    </div>
  `
}

// RENDER KEYBOARD ON PAGE LOAD

for (let i = 0; i < keys.length; i++) {
  keyboard.innerHTML += `
  <button id=${keys[i].toLowerCase()} class="key">${keys[i]}</button>
  `
}

// LISTEN FOR TYPED INPUTS AND MODIFY ARRAY

document.addEventListener('keyup', (e) => {
    if (e.which > 64 &&
        e.which < 91 &&
        letterCount < 5 &&
        rowCount < 5) {
      userWord.splice(letterCount, 1, e.key.toUpperCase())
      document.getElementById(`${rowCount}-${letterCount}`).innerText = userWord[letterCount]
      document.getElementById(`${rowCount}-${letterCount}`).classList.add('taken-box')
      letterCount++
    } else if (e.key === 'Backspace' &&
               letterCount > 0 &&
               userWord.length <= 5) {
      letterCount--
      deleteLetter()
    } else if (e.key === 'Enter' &&
              userWord.length === 5 &&
              rowCount < 5 &&
              !userWord.includes('')) {
      checkLetter()
      rowCount++
      letterCount = 0
      userWord.length = 0
    } 
  }
)

// LISTEN FOR CLICKED INPUTS AND MODIFY ARRAY

for (let i = 0; i < keys.length; i++) {
  document.getElementById(keys[i].toLowerCase()).addEventListener('click', () => {
    if (letterCount < 5 && 
        keys[i] !== 'ENTER' && 
        keys[i] !== 'DELETE') {
      userWord.splice(letterCount, 1, keys[i])
      document.getElementById(`${rowCount}-${letterCount}`).innerText = userWord[letterCount]
      document.getElementById(`${rowCount}-${letterCount}`).classList.add('taken-box')
      letterCount++
    } else if (keys[i] === 'ENTER' &&
               userWord.length === 5 && 
               !userWord.includes('')) {
      checkLetter()
      rowCount++
      letterCount = 0
      userWord.length = 0
    } else if (letterCount > 0 && keys[i] === 'DELETE') {
      letterCount--
      deleteLetter()
    }
})
}
  
// CHECK FOR MATCHING LETTERS


function checkLetter() {
  let filtered = [...hiddenWord]
  
  for (let i = 0; i < 5; i++) {
    if (userWord[i] === hiddenWord[i]) {
      filtered.splice(i, 1, '')
      document.getElementById(`${rowCount}-${i}`).classList.add('correct-place')
      document.getElementById(`${userWord[i].toLowerCase()}`).classList.remove('incorrect-place')
      document.getElementById(`${userWord[i].toLowerCase()}`).classList.add('correct-place')
      console.log('rest: ' + filtered)
    }
  }
  
  for (let i = 0; i < 5; i++) {
    if (!hiddenWord.includes(userWord[i])) {
      document.getElementById(`${rowCount}-${i}`).classList.add('incorrect-letter')
      document.getElementById(`${userWord[i].toLowerCase()}`).classList.add('incorrect-letter')
    } 
  }

  for (let i = 0; i < 5; i++) {
    if (filtered.includes(userWord[i]) &&
        filtered[i] !== '') {
      document.getElementById(`${rowCount}-${i}`).classList.add('incorrect-place')
      document.getElementById(`${userWord[i].toLowerCase()}`).classList.add('incorrect-place')
    }
  }

  if (!filtered.some(Boolean)) {
    rowCount = 5
    blur.style.display = "block"
    modalWinner.style.display = "flex"
    notification.innerText = `You win!`
  } else if (rowCount === 4 && filtered.some(Boolean)) {
    rowCount = 5
    blur.style.display = "block"
    modalWinner.style.display = "flex"
    notification.innerText = `Sorry! 
    The correct word is 
    "${hiddenWord.join('')}"
    `
  }
}  

function deleteLetter() {
  userWord.splice(letterCount, 1, (''))
  document.getElementById(`${rowCount}-${letterCount}`).innerText = userWord[letterCount]
  document.getElementById(`${rowCount}-${letterCount}`).classList.remove('taken-box', 'correct-place')
}