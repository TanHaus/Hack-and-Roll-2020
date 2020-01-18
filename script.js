let bodyHTML = document.querySelector('body')

// Create a container for each mod and the viz canvas
let container = document.createElement('container')
let vizCanvas

let ballArray = []

/**
 * Class Vector
 */
class Vector {
    /**
     * Constructor
     * @param {number} x - x componenet
     * @param {number} y - y component
     */
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    /**
     * Add another vector
     * @param {Vector} v2 - Another vector
     */
    add(v2) {
        this.x += v2.x;
        this.y += v2.y;
    }
    /**
     * Minus another vector
     * @param {Vector} v2 - Another vector
     */
    sub(v2) {
        this.x -= v2.x;
        this.y -= v2.y;
    }
}

/**
 * Particle Class
 */
class Particle {
    constructor(x, y) {
        this.acceleration = new Vector(0, 0.05)
        this.velocity = new Vector(Math.random() * 2 - 1, -Math.random())
        this.position = new Vector(x, y)
        this.lifespan = 100
        this.radius = 5
        this.lineWidth = 1
    }
    run(vizCtx) {
        this.update();
        this.display(vizCtx);
    }
    update() {
        this.position.add(this.velocity);
        this.velocity.add(this.acceleration);
        this.lifespan -= 1;
        if(this.lifespan == 0) {
            ballArray.splice(ballArray.indexOf(this), 1)
        }
    }
    display(vizCtx) {
        vizCtx.save()
        vizCtx.translate(this.position.x, this.position.y)

        vizCtx.beginPath()
        vizCtx.arc(0, 0, this.radius, 0, Math.PI * 2)
        vizCtx.lineWidth = this.lineWidth
        vizCtx.strokeStyle = `rgba(0,0,0,${this.lifespan/100})`
        vizCtx.stroke()
        
        vizCtx.restore()
    }
}

function vizLoop() {
    let ctx = vizCanvas.getContext('2d')
    ctx.clearRect(0,0,vizCanvas.width,vizCanvas.height)
    // ballArray.push(new Particle(50,20))
    for (let i=0; i<ballArray.length; i++) {
        ballArray[i].run(ctx)
    }
    ballArray.push(new Particle(vizCanvas.width/2,30))
    // if (ballArray.length==0) return
    requestAnimationFrame(vizLoop)
}

// Create the viz canvas
function setUpCanvas() {
    let vizCanvas = document.createElement('canvas')
    vizCanvas.classList.add('viz')
    return vizCanvas
}

function draw() {
    let vizCtx = vizCanvas.getContext('2d');
    vizCtx.clearRect(0, 0, vizCanvas.width, vizCanvas.height); //clear canvas
    
}
function updateCanvas(vizCanvas) {
    vizCanvas.height = vizCanvas.clientHeight
    vizCanvas.width = vizCanvas.clientWidth
    // let ballTest = new Particle(50, 20)
    // ballTest.run(vizCtx)
}

let storyScript
let loadingPromise = fetch('./storyScript2.json')
    .then((response) => {
        return response.json()
    })
    .then((jsonFile) => {
        storyScript = jsonFile
        console.log(storyScript)
    })

let Player = {
    // Variables
    'name': 'John',
    'sex': 'unidentified',
    'currentStage': 1,
    'points': 0,
    'currentSceneSectionReference': null,
    

    // Methods
    setName: function(name) {
        Player.name = name
    },
    setSex: function(sex) {
        Player.sex = sex
    },
    proceedStage: function() {
        Player.currentStage += 1
    },
    increasePoints: function(value) {
        Player.points += value
    }
}

function startMenuScreen() {
    //add game background
    let background = document.createElement("section")
    background.classList.add("background")
    bodyHTML.appendChild(background)
    //add menu
    let menu = document.createElement("section")
    menu.classList.add("menu")
    background.appendChild(menu)
    //add components of menu - title and button. 
    let gameTitle = document.createElement("h1")
    gameTitle.textContent="Game"
    let startButton = document.createElement("button");
    startButton.textContent = "Start Game"

    menu.append(gameTitle,startButton);
    // startButton.onClick = setUpModOne; 

    Player.currentSceneSectionReference = background
}

function setUpModOne() {
    let modOne = document.createElement('section')
    modOne.id = 'modOne'

    Player.currentSceneSectionReference.remove()    // remove the current scene from the DOM
    Player.currentSceneSectionReference = modOne

    return modOne
}

function setUpModTwo() {
    let modTwo = document.createElement('section')
    modTwo.id = 'modTwo'

    Player.currentSceneSectionReference.remove()
    Player.currentSceneSectionReference = modOne

    return modTwo
}

function setUpModThree() {
    let modThree = document.createElement('section')
    modThree.id = 'modThree'

    Player.currentSceneSectionReference.remove()
    Player.currentSceneSectionReference = modOne

    return modThree
}

function setUpModFour() {
    let modFour = document.createElement('section')
    modFour.classList.add('modContainer')
    modFour.id = 'modFour'

    modFour.style.backgroundImage = "url('./assets/asset1.jpg')"
    
    let avatar = document.createElement('img')
    avatar.setAttribute("src", "./assets/asset2.png")
    avatar.classList.add("avatar");

    let dialogueLine = document.createElement('p')
    dialogueLine.textContent = 'M - How’s your back, honey? (Gently places a plate of Yangzhou fried rice in front of J)'
    dialogueLine.classList.add("dialogueLine")
    
    modFour.append(avatar, dialogueLine)

    vizCanvas = setUpCanvas()


    container.append(modFour, vizCanvas)
    
    bodyHTML.appendChild(container)
    updateCanvas(vizCanvas)

    requestAnimationFrame(vizLoop)
    
    // Player.currentSceneSectionReference.remove()
    Player.currentSceneSectionReference = modFour


    return modFour
}
function createButton(option){
    let button = document.createElement("button");
    button.classList.add("button");
    button.textContent = option
    //add event handler 
    button.onclick = function(){
        alert("pass");
    }
    return button; 
}

function createDecision(episode){ //episode = storyScript.module#[#]
    let wrapper = document.createElement("section");
    for(let i=0; i<3; i++){
        wrapper.appendChild(createButton(episode.options[i].desc));
    }
    bodyHTML.appendChild(wrapper);

    return wrapper; 
}


// function setUpReportCard() {

// }

//TESTING
async function test() {
    await loadingPromise; 
    createDecision(storyScript.module1[0]);
}
test();
// startMenuScreen()
// setUpModFour()
// setDecisionPage()





