
const container = document.getElementById('playground');
document.body.addEventListener('keydown', keyPress);

let goalHasRegistred = false;
let firstMove = true;
let goalsFilled = 0;
let level = 1;
let goals = 0;    

const Player = 
{
    posX: 0,
    posY: 0
}

let playerImg = document.createElement('img');
playerImg.src='Images/Characters/Character4.png';
let blockImg = document.createElement('img');
blockImg.src='Images/Crates/Crate_Purple.png';
let goalImg = document.createElement('img');
goalImg.src='Images/Endpoints/EndPoint_Red.png';
let previousWasAGoalTile = false;

function createMap(level)
{
   let map;
   let height;
   let width;

   switch (level)
   {
    case 1:
        map = tileMap01;
        break;
    case 2:
        map = tileMap02;
        break;
    case 3:
        map = tileMap03;
        break;
    case 4:
        map = tileMap04;
        break;
    case 5:
        map = tileMap05;
        break;
    }

    width = map.width;
    height = map.height;
    container.style.setProperty('--grid-rows', height);
    container.style.setProperty('--grid-cols', width);


   for (let row=0;row<height;row++)
   {
        for (let col=0;col<width;col++)
        {
            let element = document.createElement('div');
            element.id = 'x' + col+ 'y' + row;
           
            let tile = map.mapGrid[row][col][0];
            
            let className = ' ';
            switch (tile)
            {
                case ' ':
                    className = Tiles.Space;
                    break;
                case 'G':
                    className = Tiles.Goal
                    break;
                case 'W':
                    className = Tiles.Wall;
                    break;
                case 'P':
                    className = Entities.Character;
                    Player.posX = col;
                    Player.posY = row;
                    break;
                case 'B':
                    className = Entities.Block;
                    break;
                default:
                    break;
            }

            classes = className.split('-');
            element.classList.add(classes[0], classes[1]);
            container.appendChild(element);     
        }
   }

   // Insert walls
   let walls = document.getElementsByClassName('tile wall');
   for (let i=0;i<walls.length;i++)
   {
        let img = document.createElement('img');
        img.src='Images/Walls/Wall_Black.png';
        walls[i].appendChild(img);
   }

   //Insert blocks
   let blocks = document.getElementsByClassName('Block block');
   for (let i=0;i<blocks.length;i++)
   {
        let img = document.createElement('img');
        img.src='Images/Crates/Crate_Purple.png';
        blocks[i].appendChild(img);
   }

   //Insert goals
   let goalTiles = document.getElementsByClassName('tile goal');
   goals = goalTiles.length;
   for (let i=0;i<goalTiles.length;i++)
   {
        let img = document.createElement('img');
        img.src='Images/Endpoints/EndPoint_Red.png';
        goalTiles[i].appendChild(img);
   }

   //Insert player
   let player = document.getElementsByClassName('Character player');
  
   player[0].appendChild(playerImg);

}

const keys = {
    left: 37,
    up: 38,
    right: 39,
    down: 40
  };

function keyPress(e)
{
    let currentPos = [Player.posX, Player.posY];
    let direction = '';

    switch (e.keyCode) 
    {
        case keys.left:
            e.preventDefault();
            Player.posX--;
            direction = 'left';    
            break;
        case keys.up:
            e.preventDefault();
            Player.posY--;
            direction = 'up';
            break;
        case keys.right:
            e.preventDefault();
            Player.posX++;
            direction = 'right';
            break;
        case keys.down:
            e.preventDefault();
            Player.posY++;
            direction = 'down';
            break;
        
    }

    //Get positions and cells
    let nextPos = [Player.posX, Player.posY]; 
    let nextNextPos = getNextNextPosition(nextPos, direction);
    let currentCell = document.getElementById('x' + currentPos[0] + 'y' + currentPos[1]);
    let nextCell = document.getElementById('x' + nextPos[0] + 'y' + nextPos[1]);
    let nextNextCell = document.getElementById('x' + nextNextPos[0] + 'y' + nextNextPos[1]);
    
    selectPlayerImg(direction);
    
    if (!isWalkable(nextPos, direction))
    { 
        resetPlayerPos(currentPos);
    }
    else if (nextIsABox(nextCell)) //Next is a box
    {
        if (!isWalkable(nextPos, direction))
        {
            resetPlayerPos(currentPos);
        }
        else if (!nextNextIsAGoalTile(nextNextCell)) //NextNext is empty
        {
            if (nextNextCell.className!='Goal goal')
            {
            nextNextCell.className = 'Block block';
            nextNextCell.appendChild(blockImg.cloneNode(true));
            nextCell.className = 'tile space';
            nextCell.firstChild.replaceWith(playerImg);
            if (previousWasAGoalTile)
                currentCell.appendChild(goalImg.cloneNode(true));
            previousWasAGoalTile = false;
           }
        }
        else //NextNext is a goal tile
        {
            nextNextCell.className = 'Goal goal';
            checkWin(++goalsFilled);
            goalHasRegistred = true;
            nextNextCell.firstChild.replaceWith(blockImg.cloneNode(true));
            nextCell.firstChild.replaceWith(playerImg);
            nextCell.className = 'tile space';
        }

    }
    else if (nextIsAGoalGoal(nextCell)) //Next is a Goal goal
    {
        if (!isWalkable(nextPos, direction))
        {
            resetPlayerPos(currentPos);
        }
        else if (nextNextIsAGoalTile(nextNextCell))
        {
            nextNextCell.className = 'Goal goal';
            checkWin(goalsFilled);
            goalHasRegistred = false;
            
            nextNextCell.firstChild.replaceWith(blockImg.cloneNode(true));
            nextCell.className = 'tile goal';
            nextCell.firstChild.replaceWith(playerImg);
            
            if (previousWasAGoalTile)
                currentCell.appendChild(goalImg.cloneNode(true));
            previousWasAGoalTile = true;
            
            
        }
        else //NextNext is a space tile on the way from goal tile
        {
            nextNextCell.className = 'Block block';
            nextNextCell.appendChild(blockImg.cloneNode(true));
            nextCell.firstChild.replaceWith(playerImg);
            if (previousWasAGoalTile)
            {
                currentCell.appendChild(goalImg.cloneNode(true));
                nextCell.className = 'tile goal';
            }
        }
    }

    else //Next has no block
    {   
        if (nextCell.className==='tile goal'&& !previousWasAGoalTile)
        {
            nextCell.firstChild.replaceWith(playerImg);
            previousWasAGoalTile = true;
        }
        else if (nextCell.className==='tile goal' && previousWasAGoalTile)
        {
            nextCell.firstChild.replaceWith(playerImg);
            currentCell.appendChild(goalImg.cloneNode(true));
            previousWasAGoalTile = true;
        }
        else
        {
            nextCell.appendChild(playerImg);
            if (firstMove)
            {
                currentCell.className = 'tile space';
                firstMove = false;
            }
            
            if (previousWasAGoalTile)
            {
                previousWasAGoalTile = false;
                currentCell.appendChild(goalImg.cloneNode(true));
            }
        }
    }
}


function selectPlayerImg(direction)
{
    
     switch (direction){
        case 'up':
            playerImg.src='Images/Characters/Character8.png';
             break;
        case 'down':
            playerImg.src='Images/Characters/Character5.png';
             break;
        case 'left':
            playerImg.src='Images/Characters/Character10.png';
             break;
        case 'right':
            playerImg.src='Images/Characters/Character3.png';
             break;
     }
}

function checkWin(goalsFilled)
{
    if (goalsFilled===goals)
    {
        let winMessage = document.getElementById('message').innerHTML = 
        'Congratulations! You win!';
        document.getElementById('message').style.color = "yellow";
    }
}

function resetMessage()
{
    let winMessage = document.getElementById('message').innerHTML = 
        'Good luck!';
    document.getElementById('message').style.color = "black";
}

function nextIsAGoalGoal(nextCell)
{
    if (nextCell.className==='Goal goal')
        return true;
    else
        return false;
}

function nextNextIsAGoalTile(nextNextCell)
{
    if (nextNextCell.className==='tile goal')
        return true;
    else
        return false;
}

function nextIsAGoalTile(nextCell)
{
    if (nextCell.className==='tile goal')
        return true;
    else
        return false;
}

function nextIsABox(nextCell)
{
    if (nextCell.className==='Block block')
        return true;
    else
        return false;
}

function resetPlayerPos(currentPos)
{
   
    Player.posX = currentPos[0];
    Player.posY = currentPos[1];
}

function isWalkable(nextPos, direction)
{
    let nextCell = document.getElementById('x' + nextPos[0] + 'y' + nextPos[1]);
    let nextNextPos = getNextNextPosition(nextPos, direction);
    let nextNextCell = document.getElementById('x' + nextNextPos[0] + 'y' + nextNextPos[1]);
   
    switch (nextCell.className)
    {
        case 'tile wall':
            return false;
            break;
        case 'Block block':
            if (nextNextCell.className==='Block block'||
            nextNextCell.className==='tile wall' ||
            nextNextCell.className==='Goal goal')
                 return false;
            else 
                 return true;
            break;
        case 'tile goal':
                return true;
            break;
        case 'Goal goal':
            if (nextNextCell.className==='tile goal'||
            nextNextCell.className==='tile space')
                return true;
            else
                return false;
        case 'tile space':
            return true;
            break;
    }
}

function getNextNextPosition(nextPos,direction)
{
    const next = [nextPos[0], nextPos[1]];

    switch (direction){
        case 'left':
            next[0]--;
            break;
        case 'up':
            next[1]--;
            break;
        case 'right':
            next[0]++;
            break;
        case 'down':
            next[1]++;
            break;
    }
    return next;
}

function removeAllChildNodes(parent) 
{
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }
}

function nextLevel()
{
    firstMove = true;
    resetMessage();
    const container = document.querySelector('#playground');
    removeAllChildNodes(container);
    if (level<5)
        createMap(++level);
    else
        createMap(level);
}

function previousLevel()
{
    firstMove = true;
    resetMessage();
    const container = document.querySelector('#playground');
    removeAllChildNodes(container);
    if (level>1)
        createMap(--level);
    else
    createMap(level);
}

function reset()
{
    firstMove = true;
    resetMessage();
    const container = document.querySelector('#playground');
    removeAllChildNodes(container);
    createMap(level);
}

createMap(level);


