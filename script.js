let Player = {
    // Variables
    'name': 'John',
    'sex': 'unidentified',
    'currentStage': 1,
    'currentEpisode': 1,
    'wealth': 50, //determines the radius of Particles
    'happiness': 50, //determines the saturation and luminance of the Particles
    'health': 50, //determines the inital velocity and acceleration of the Particles
    'currentSceneSectionReference': null,
    'decisionWrapper': null,
    'episodeContainerReference': null,
    'upperContainerReference': null,
    

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
    },
    clearUpperContainer: function() {
        Player.upperContainerReference.firstChild.remove()
    }
}

let bodyHTML = document.querySelector('body')
// Create a container for each mod and the viz canvas
let container = document.createElement('section')
container.classList.add('biggestContainer')

let particleArray = []

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
        this.acceleration = new Vector(0, visualizer.particleAcceleration)
        this.velocity = new Vector((Math.random()*2-1)*visualizer.particleVelocity, -Math.random())
        this.position = new Vector(x, y)
        this.lifespan = 100
        this.radius = visualizer.particleRadius
        this.lineWidth = 1
        this.color = visualizer.particleColorHsl
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
            particleArray.splice(particleArray.indexOf(this), 1)
        }
        
    }
    display(vizCtx) {
        vizCtx.save()
        vizCtx.translate(this.position.x, this.position.y)

        vizCtx.beginPath()
        vizCtx.arc(0, 0, this.radius, 0, Math.PI * 2)
        vizCtx.lineWidth = this.lineWidth
        vizCtx.strokeStyle = `rgba(255, 255, 255, ${this.lifespan/100})`
        vizCtx.stroke()
        vizCtx.fillStyle = this.color
        vizCtx.globalAlpha = this.lifespan/100
        vizCtx.fill()
        
        vizCtx.restore()
    }
}

let visualizer = {
    vizCanvas: null,
    vizCtx: null,
    canvasWidth: 0,
    canvasHeight: 0,
    animationRequestId: 0,
    particleColor: '',
    particleRadius: 0,
    particleAcceleration: 0,
    particleVelocity: 0,

    

    setUp: function() {
        let canvas = document.createElement('canvas')
        canvas.classList.add('viz')

        visualizer.vizCanvas = canvas
        visualizer.vizCtx = canvas.getContext('2d')
    },
    updateDimension: function() {
        visualizer.canvasHeight = visualizer.vizCanvas.height = visualizer.vizCanvas.clientHeight
        visualizer.canvasWidth = visualizer.vizCanvas.width = visualizer.vizCanvas.clientWidth
    },
    clear: function() {
        let ctx = visualizer.vizCtx
            width = visualizer.canvasWidth
            height = visualizer.canvasHeight
     
        ctx.clearRect(0,0,width,height)
    },
    run: function() {
        function vizLoop() {
            visualizer.clear()
            for (let i=0; i<particleArray.length; i++) {
                particleArray[i].run(visualizer.vizCtx)
            }
            visualizer.particleColorHsl = `hsl(${Math.random()*360}, ${Player.happiness}%, ${Player.happiness}%)`
            visualizer.particleRadius = Player.wealth/10
            visualizer.particleAcceleration = Player.happiness/1000
            visualizer.particleVelocity = Player.happiness/50
            particleArray.push(new Particle(visualizer.canvasWidth/2,30))
            
            visualizer.animationRequestId = requestAnimationFrame(vizLoop)
        }

        visualizer.animationRequestId = requestAnimationFrame(vizLoop)
    }, 
    stop: function() {
        cancelAnimationFrame(visualizer.animationRequestId)
    }
}

// Load story script from the json file
let storyScript
let loadingPromise = fetch('./storyScriptPython.json')
    .then((response) => {
        return response.json()
    }).then((jsonFile) => {
        storyScript = jsonFile
    })

function createDialogue(episodeObject) {
    dialogueBlock = episodeObject.dialogue

    let episodeContainer = document.createElement('section')
    episodeContainer.classList.add('episodeContainer')
    episodeContainer.style.backgroundImage = `url('./assets/bg${episodeObject["id"]}.jpg')`
    
    //dialogue line and its wrapper 
    let dialogueBox = document.createElement('section')
    dialogueBox.classList.add("dialogueBox");

    let dialogueLine = document.createElement('p')
    dialogueLine.classList.add("dialogueLine")
    dialogueBox.appendChild(dialogueLine)

    //name and its wrapper 
    let charName = document.createElement('h2');
    charName.classList.add("charName");

    let charNameContainer = document.createElement('section')
    charNameContainer.append(charName)
    charNameContainer.classList.add('charNameContainer')

    //character
    let characters = {}
    let avatarContainer = document.createElement('section')
    avatarContainer.classList.add('avatarContainer')

    for(key in episodeObject.characters) {
        let name = episodeObject.characters[key]

        let avatar = document.createElement('img')
        avatar.classList.add("avatar");
        avatar.src=`./assets/${name}.png`

        avatarContainer.append(avatar)
        characters[name] = avatar
    }

    let continueButton = document.createElement('button')
    continueButton.classList.add('continueButton')
    continueButton.textContent = '>'
    continueButton.onclick = function() {
        i += 1
        if (i == dialogueBlock.length) {
            for(key in characters) {
                characters[key].remove()
            }
            charName.remove()
            dialogueBox.remove()
            continueButton.remove()
            decisionBlock = createDecision(episodeObject)
            episodeContainer.append(decisionBlock)
        }
        updateFrame(i)
    }
    
    function updateFrame(i) {
        // handle the avatars
        let activeCharacter = dialogueBlock[i].name
        for(key in characters) {
            characters[key].classList.remove('activeCharacter')
        }
        characters[activeCharacter].classList.add('activeCharacter')

        // handle the paragraph
        j = 0
        clearTimeout(timeoutid)
        let dialogueContent = dialogueBlock[i].text;
        charName.textContent = dialogueBlock[i].name;


        dialogueLine.textContent = ''
        typeWriter(dialogueLine, dialogueContent);
    }
    let j = 0
    let timeoutid = 0;   
    function typeWriter(line, text) {
        if (j < text.length) {
          line.textContent += text[j];
          j++;
          timeoutid = setTimeout(() => typeWriter(line, text), 20);
        }
    }
    
    let i = 0
    updateFrame(i)
    episodeContainer.append(avatarContainer, dialogueBox, charName, continueButton)

    return episodeContainer
}


    // Methods
    clearUpperContainer: function() {
        if(Player.upperContainerReference!=null) Player.upperContainerReference.firstChild.remove()
    }
}

function loadEpisode(episode = Player.currentEpisode, stage = Player.currentStage) {
    episodeObject = storyScript[`stage${stage}`][episode - 1]
    Player.clearUpperContainer()
    Player.upperContainerReference.append(createDialogue(episodeObject))
}

function loadTitleAndOpening(episode = Player.currentEpisode, stage = Player.currentStage) {
    episodeObject = storyScript[`stage${stage}`][episode - 1]
    let title = episodeObject.title
        opening = episodeObject.opening
    
    let group = document.createElement('section')
    group.classList.add('episodeContainer')

    let episodeTitle = document.createElement('h1')
    episodeTitle.textContent = title

    let episodeOpening = document.createElement('p')

    let nextButton = document.createElement('button')
    nextButton.textContent = '...'
    nextButton.onclick = () => {
        clearTimeout(timeoutid)
        loadEpisode()
    }

    let j = 0
    let timeoutid = 0;   
    function typeWriter(textObject, text) {
        if (j < text.length) {
          textObject.textContent += text[j];
          j++;
          timeoutid = setTimeout(() => typeWriter(textObject, text), 50);
        }
    }
    
    typeWriter(episodeOpening, opening)

    group.append(episodeTitle, episodeOpening, nextButton)
    Player.upperContainerReference.append(group)
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
    gameTitle.textContent = "The Singaporean Dream"

    //buttons

    let stageArray = ["1: Young Adult", "2: Working Adult", "3: Silver Years"]

    let startButton = document.createElement("button");
    startButton.textContent = "Play"
    startButton.onclick = setUpStage

    let optionButton = document.createElement("button");
    optionButton.textContent = "Jump To ..."
    optionButton.onclick = function (){
        // //stage buttons 
        // //Stage 1 
        // let st1 = document.createElement("button");
        // st1.textContent = stageArray[0];
        // st1.classList.add("stageButton");
        // st1.onclick = function(){
        //     //S1 E1 
        //     let st11 = document.createElement("button");
        //     st11.textContent = storyScript.stage1[0].title; 
        //     st11.classList.add("st1Button");
        //     menu.appendChild(st11);
        //     //S1 E2 
        //     let st12 = document.createElement("button");
        //     st12.textContent = storyScript.stage1[1].title; 
        //     st12.classList.add("st1Button");
        //     menu.appendChild(st12);
        //     //S1 E3 
        //     let st13 = document.createElement("button");
        //     st13.textContent = storyScript.stage1[2].title; 
        //     st13.classList.add("st1Button");
        //     menu.appendChild(st13);
        // }
        // //Stage 2
        // let st2 = document.createElement("button");
        // st2.textContent = stageArray[1];
        // st2.classList.add("stageButton");
        // st2.onclick = function(){
        //     //S2 E1 
        //     let st21 = document.createElement("button");
        //     st21.textContent = storyScript.stage2[0].title; 
        //     st21.classList.add("st2Button");
        //     menu.appendChild(st21);
        //     //S2 E2 
        //     let st22 = document.createElement("button");
        //     st22.textContent = storyScript.stage2[1].title; 
        //     st22.classList.add("st2Button");
        //     menu.appendChild(st22);
        //     //S2 E3 
        //     let st23 = document.createElement("button");
        //     st23.textContent = storyScript.stage2[2].title; 
        //     st23.classList.add("st2Button");
        //     menu.appendChild(st23);
        // }
        // //Stage 3
        // let st3 = document.createElement("button");
        // st3.textContent = stageArray[2];
        // st3.classList.add("stageButton");
        // st3.onclick = function(){
        //     //S3 E1 
        //     let st31 = document.createElement("button");
        //     st31.textContent = storyScript.stage3[0].title; 
        //     st31.classList.add("st3Button");
        //     menu.appendChild(st31);
        //     //S3 E2 
        //     let st32 = document.createElement("button");
        //     st32.textContent = storyScript.stage3[1].title; 
        //     st32.classList.add("st3Button");
        //     menu.appendChild(st32);
        //     //S3 E3 
        //     let st33 = document.createElement("button");
        //     st33.textContent = storyScript.stage3[2].title; 
        //     st33.classList.add("st3Button");
        //     menu.appendChild(st33);
        let optionsContainer = document.createElement('section')
        optionsContainer.classList.add('optionsContainerButtons')

        for (let i=0; i<3;i++){
            // let stageContainer = document.createElement('section')
            // stageContainer.classList.add('stageContainerButtons')

            let btn = document.createElement("button")
            optionsContainer.append(btn)
            btn.textContent = stageArray[i];
            btn.classList.add("stageButton");

            for(let j=0;j<3;j++){
                let button = document.createElement("button")
                button.textContent = storyScript[`stage${i+1}`][j].title
                button.classList.add('episodeButton')
                optionsContainer.append(button)
                // stageContainer.append(button)
            }
            // menu.append(stageContainer)
        }
        // menu.append(st1,st2,st3);
        menu.append(optionsContainer)
    }
    
    let fullscreenButton = document.createElement('button')
    fullscreenButton.textContent = 'Fullscreen'
    fullscreenButton.onclick = () => document.documentElement.requestFullscreen()
    
    async function addButton() {
        await loadingPromise
        menu.append(gameTitle,startButton, fullscreenButton,optionButton); 
    }

    addButton()

    Player.currentSceneSectionReference = background
}

function setUpStage() {
    Player.currentSceneSectionReference.remove()
    visualizer.setUp()
    let upperContainer = document.createElement('section')
    Player.upperContainerReference = upperContainer
    container.append(upperContainer, visualizer.vizCanvas)

    bodyHTML.append(container)

    visualizer.updateDimension()
    visualizer.run()

    loadTitleAndOpening()

    // Player.currentEpisode = 3
    // Player.currentStage = 3
}

function nextEpisode() {
    if(Player.currentEpisode<3) {
        Player.currentEpisode += 1

    } else {
        Player.currentEpisode = 1
        
        if(Player.currentStage<3) {
            Player.currentStage += 1
        
        } else {
            setUpReportCard()
            return
        }
    }
    
    Player.clearUpperContainer()
    loadTitleAndOpening()
}

function createButton(option){
    //this function generate decision buttons
    let button = document.createElement("button");
    button.classList.add("decButton");
    button.textContent = option.desc;
    //add event handler 
    button.onclick = function(){
        //update Player's fields
        Player.health += option.point.Health; 
        Player.wealth += option.point.Wealth; 
        Player.happiness += option.point.Happiness; 
        
        //advance to outcome page 
        Player.decisionWrapper.remove();
        Player.decisionWrapper = null; 
        setOutcomePage(option);
    }
    return button; 
}

function createDecision(episode){ //episode = storyScript.stage#[#]
    //this function generate the 3 decisions in an episode. 

    //wrapper for everything 
    let wrapper = document.createElement("section");
    wrapper.classList.add("wrapper");

    //title and its wrapper 
    let title = document.createElement("h1");
    title.classList.add("decTitle");
    title.textContent = "What should I do?";

    let titWrapper = document.createElement("section");
    titWrapper.classList.add("titWrapper");
    titWrapper.appendChild(title);

    //subtitle and its wrapper 
    let subTitle = document.createElement("p");
    subTitle.classList.add("subTitle");
    subTitle.textContent = episode.decision; 

    let subWrapper = document.createElement("section");
    subWrapper.classList.add("subWrapper");
    subWrapper.appendChild(subTitle);

    //button and its wrapper 
    let buttonWrapper = document.createElement("section");
    buttonWrapper.classList.add("buttonWrapper");

    for(let i=0; i<3; i++){
        buttonWrapper.appendChild(createButton(episode.options[i]));
    }
    wrapper.append(titWrapper,subWrapper,buttonWrapper);
    Player.decisionWrapper = wrapper; 
    // bodyHTML.append(wrapper);

    // animation
    Player.upperContainerReference.classList.add('addFlash')
    setTimeout(() => Player.upperContainerReference.classList.remove('addFlash'), 1000)

    return wrapper; 
}

function setOutcomePage(option){
    let wrapper = document.createElement("section");
    wrapper.classList.add("wrapper");

    let title = document.createElement("h1");
    title.classList.add("decTitle");
    title.textContent = "Outcome";
    
    let button = document.createElement('button')
    button.textContent = 'Next'
    button.onclick = nextEpisode

    //subtitle and its wrapper 
    let subTitle = document.createElement("p");
    subTitle.classList.add("subTitle");
    subTitle.textContent = option.outcome; 

    let subWrapper = document.createElement("section");
    subWrapper.classList.add("subWrapper");
    subWrapper.appendChild(subTitle);
    
    //append
    wrapper.append(title,subWrapper,button);
    Player.clearUpperContainer()
    Player.upperContainerReference.append(wrapper);
    return wrapper; 
}

function setUpRadarChart(PlayerObject) {

    let radarChart = document.createElement("canvas");
    radarChart.setAttribute("id", "myChart");
    radarChart.setAttribute("width", "100%");
    radarChart.setAttribute("height", "70%");
    radarChart.classList.add("radar")

    bodyHTML.append(radarChart);

    var ctx = radarChart.getContext('2d');
    var chart = new Chart(ctx, {
    type: 'radar',
    data: {
        labels: ['Wealth', 'Health', 'Happiness'],
        datasets: [{
            label: 'My First dataset',
            backgroundColor: 'rgb(153, 204, 255, 0.5)',
            borderColor: 'rgb(153, 204, 255)',
            data: [Player['wealth'], Player['happiness'], Player['happiness']]
        }]
    },

    options: {
        scale: {
            angleLines: {
                display: false
            },
            ticks: {
                suggestedMin: 0,
                suggestedMax: 100
            }
        }
    }
    });
}

function createEndButtons() {
    let infoButton = document.createElement('button')
    infoButton.textContent = 'More'
    infoButton.onclick = ""

    let restartButton = document.createElement('button')
    restartButton.textContent = 'Restart Game'
    restartButton.onclick = ""

    let quitButton = document.createElement('button')
    quitButton.textContent = 'Quit Game'
    quitButton.onclick = ""
    bodyHTML.append(infoButton, restartButton, quitButton)
}

function setUpReportCard(){
    
    container.firstElementChild.remove();
    container.firstElementChild.remove();
    
    setUpRadarChart(Player);
    createEndButtons();

}


// //TESTING
// async function test() {
//     await storyScript; 
//     createDecision(storyScript.stage1[0]);
// }
// // test();
// // startMenuScreen();
// async function testFuck() {
//     await storyScript;
//     setUpModFour()
// }
// // test();
// testFuck()
// setDecisionPage()


//setUpReportCard();
startMenuScreen()