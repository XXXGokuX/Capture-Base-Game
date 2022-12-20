canvas= document.getElementById('canvas')
ctx= canvas.getContext('2d')

const canvasW= canvas.width= 600
const canvasH= canvas.height= 400

//VARIABLES
const cellSize= 100
const cellGap= 3
const gameGrid= []
const defenders= []
const defenderCost= 100
var money= 300
let moneyContainer= []
const enemies= []
let enemySpawnInterval= 600
const enemyVerticalPositions= []
const floatingMessage= []
const diffEnemy= []
const enemyActions= []
const enemyFrames= []
let gameOver= false
var score= 0
let frame= 0

//Different Enemy Actions Image
enemyActions.push({
  "walk": "https://i.postimg.cc/B6g313KW/Walk.png",
  "gethit" : "https://i.postimg.cc/kMczQwhm/b.png",
  "attack" : "https://i.postimg.cc/qBsCBDM2/c.png",
  "death" : "https://postimg.cc/bsHFrQ6Q"
 })
//Different Enemy Actions Frames

enemyFrames.push({
    "walk": 3,
    "gethit": 3,
    "attack": 7,
    "death": {
      startFrame: 3
    }
})

const enemy1= new Image()
enemy1.src= enemyActions[0].walk
diffEnemy.push(enemy1)





//TOP-CONTROL-BAR
const controlBar= {
     width: canvasW,
     height: cellSize
}

//MOUSE COORDINATE
const mouse= {
  x:undefined,
  y:undefined,
  
  height:0.1,
  width:0.1
} 
//CANVAS POSITION
const canvasPosition= canvas.getBoundingClientRect()

//EVENT-LISTENER ON MOUSE
canvas.addEventListener("mousemove",(e)=>{
    
    mouse.x= e.x - canvasPosition.left;
    mouse.y= e.y - canvasPosition.top;
})

canvas.addEventListener("mouseleave",(e)=>{
  
  mouse.x= undefined
  mouse.y= undefined
})

//EACH CELL
class Cell
  {
      constructor(x,y)
      {
         this.x= x
         this.y= y
         this.width= cellSize
         this.height= cellSize
      }
      
      draw()
      {
         if(isCollide(this,mouse) && mouse.x && mouse.y)
           {
               ctx.strokeStyle= "black"
               ctx.strokeRect(this.x,this.y,this.width,this.height)
           }
        
      }
  }

//CREATING GRID..........
for(let row= 0; row<=canvasW ; row+=cellSize)
  {
     for(let col=cellSize ; col<=canvasH ; col+=cellSize)
       gameGrid.push(new Cell(row,col))
    
  }

//DISPLAY GRID 
function displayGrid()
{
   gameGrid.forEach(cellObj => cellObj.draw())
}


//DEFENDER
class Defender{
   
   constructor(x,y)
   {
      this.x= x
      this.y= y
      this.width= cellSize
      this.height= cellSize
     
      this.health= 100
      this.projectiles= []
      this.shooting= false
      this.timer= 0 
   }
  update()
  {
     this.timer++;
     
     //Shoot if enemy is present
     if(enemyVerticalPositions.includes(this.y)) this.shooting= true
     else this.shooting= false
    
     if(this.timer%100 === 0 && this.shooting)
       this.projectiles.push(new Bullet(this.x+this.width,this.y+this.height/4))
     
  }
  
  
  draw()
  {
      //Defender Rect at (x,y)
      ctx.fillStyle= "blue"
      ctx.fillRect(this.x,this.y,this.width,this.height)
      
      //Defender Health
      ctx.fillStyle= "gold"
      ctx.font= "20px Arial"
      ctx.fillText(Math.floor(this.health),this.x+this.width/3,this.y+this.height/4)
    
  }
  
}

//CREATING DEFENDERS....
canvas.addEventListener('click',()=>{
  //Get Click Co-ordinate
    defenderPosX= mouse.x - (mouse.x%cellSize)
    defenderPosY= mouse.y - (mouse.y%cellSize)
     
    if(money < defenderCost)
      {
          //Show No Enough Money
          floatingMessage.push(
            new FloatingMessage("Required More Money",defenderPosX-25,defenderPosY+25,15,'black'))
        return;
      }
  
  
    if(defenderPosY < cellSize ||
       defenders.some(obj=> obj.x===defenderPosX 
                      && 
                      obj.y===defenderPosY)) 
      return;
  
    //Create defnder on above co-ordinate
    defenders.push(new Defender(defenderPosX,defenderPosY))
    //Update Money
    money -= defenderCost 
})


//DISPLAYING DEFENDERS.......
function displayDefender()
{
    for(let di=0; di<defenders.length ; di++)
      { 
        
        defenders[di].update()
        defenders[di].draw()
        //If Defender Collide with Enemy
        enemies.forEach((eobj,ei) =>{
          
           if(defenders[di] && isCollide(eobj,defenders[di]))
             {
                 //If Collide ???
                 eobj.movement= 0
                 eobj.attack= true
               
                 defenders[di].health -= 0.2
             }
            
           //If defender Loose
           if(defenders[di] && defenders[di].health <= 0)
             {
                defenders.splice(di,1)
                di--;
                eobj.movement= eobj.speed
             }
          
        }) 
       
    }
  
}

//BULLET
class Bullet{
   
  constructor(x,y)
  {
     this.x= x
     this.y= y
     this.width= 10
     this.height= 10
     this.power= 20
     this.speed= 5
     
  }
  update()
  {
     //Moving... Bullets
     this.x += this.speed
  }
  
  draw()
  {
     //Drawing Bullet
     ctx.fillStyle= 'black'
     ctx.beginPath()
     ctx.arc(this.x,this.y,this.width,0,Math.PI * 2)
     ctx.fill()
  }
  
}

//DISPLAYING DEFENDERS BULLETS
function displayBullets()
{
    defenders.forEach(dobj=>{
       
       //Shoot Only if allowed
    if(dobj.shooting)
      {   
      
       //Each Enemies Bullet present in  its projectiles
       for(let bi=0; bi<dobj.projectiles.length ; bi++)
         {
             dobj.projectiles[bi].update()
             dobj.projectiles[bi].draw()
           
           //If Bullet Collide With Enemy decreases its health
           for(let ei=0 ; ei<enemies.length ; ei++)
             {
                 if(dobj.projectiles[bi] && enemies[ei] &&
                   isCollidev1(dobj.projectiles[bi],enemies[ei]))
                   {
                      //Collide b/w Bullet & Enemy
                      enemies[ei].health -= dobj.projectiles[bi].power
                     //Enemy Collision with Bullet Effect
                  
                    
                     //Enemy Again Walk
                     
                     
                      dobj.projectiles.splice(bi,1)
                      bi--
                   }
               
                 //If Enemy Health bcms Zero
                 if(enemies[ei].health <= 0)
                   {
                      //Player gets Award for Defeating Enemy
                      money += enemies[ei].maxHealth/10
                      score += enemies[ei].maxHealth/10
                     
                      //Float Msg
                      floatingMessage.push(new FloatingMessage(
                      `+${enemies[ei].maxHealth/10}`,
                        enemies[ei].x+25,
                        enemies[ei].y+25,
                        30,
                        'gold'
                      )) 
                     
                      enemyVerticalPositions.splice(ei,1)
                      enemies.splice(ei,1)
                      ei-- 
                   }
             }
           
           
           //Boundry Of Bullet
           if(dobj.projectiles[bi] 
              && 
              dobj.projectiles[bi].x > canvasW-cellSize)
             {
                dobj.projectiles.splice(bi,1)
                bi--;
             }
         }
      }
    })
    
}


//ENEMY
class Enemy{
   constructor(verticalPosition)
  {
      this.x= canvasW
      this.y= verticalPosition
      this.width= cellSize
      this.height= cellSize
    
      this.speed= Math.random()*0.2 + 0.4
      this.movement= this.speed
      this.health= 100
      this.maxHealth= this.health
      this.bullets= []
      this.enemyNo= 0
      this.enemyImg= diffEnemy[this.enemyNo]
      this.attack= false
      this.spriteWidth= 150
      this.spriteHeight= 150
      this.maxFrame= 3
      this.frameX= 0
      this.frameInterval= 10
  }
  
  update()
  {
      this.x -= this.movement
      if(frame%this.frameInterval == 0)
        {
           if(this.frameX < this.maxFrame) this.frameX++
           else this.frameX= 0
        }
  }
  
  draw()
  {
    //Enemy  Rect at (x,y)
    ctx.drawImage(this.enemyImg,this.frameX*this.spriteWidth,0,this.spriteWidth,this.spriteHeight,this.x,this.y,this.width,this.height)
    
    //Enemy Health
      ctx.fillStyle= "black"
      ctx.font= "20px Arial"
        ctx.fillText(Math.floor(this.health),this.x+this.width/3,this.y+this.height/4)
  }
  
}


//UPDATING... AND DRAWING ENEMIES....
function displayEnemy()
{
    //move and draw enemy
    enemies.forEach(eobj => {
      
        eobj.update()
        eobj.draw()
        
        //If Enemy  Reach Its Destination  GAME-OVER
        if(eobj.x < 0)
          gameOver= true
    })
  
   //Adding  Enemy in game every 100s
    if(frame%enemySpawnInterval == 0)
      {
          let vPos= Math.floor(Math.random()*3 + 1) * cellSize
          enemies.push(new Enemy(vPos))
          enemyVerticalPositions.push(vPos)
          
          //Decreasing Enemy Spawn Interval
          if(enemySpawnInterval > 120)
           enemySpawnInterval -= 50 
      }
   
   
}

//MONEY
let amount= [30,40,50] //amount options
class Money{
  constructor()
  {
    this.x= Math.random() * (canvasW-(cellSize*2)) + cellSize
    this.y= (Math.floor(Math.random()*2 + 1) * cellSize) + 25
    this.width= cellSize * 0.6
    this.height= cellSize * 0.6
    this.amount= amount[Math.floor(Math.random() * amount.length)]
    this.selected= false
    this.angle= Math.atan((this.y-75)/(this.x-cellSize))
    this.speedY= 3 * Math.sin(this.angle)
    this.speedX= 3 * Math.cos(this.angle)
   }
  update()
  {
      if(this.selected)
        {
            this.x -= this.x-cellSize >0 ? this.speedX: -this.speedX
            this.y -= this.speedY
        }
    
  }
  
  draw()
  {
     ctx.fillStyle= 'yellow'
     ctx.fillRect(this.x,this.y,this.width,this.height)
     ctx.fillStyle= 'black'
     ctx.font= '20px Arial'
     ctx.fillText(this.amount, this.x+15 , this.y+25)
  }
  
}

//DISPLAYING MONEY
function displayMoney()
{
    if(frame%600 === 0 && frame)
      moneyContainer.push(new Money())
   
    //Draw Money
    for(let mi=0 ; mi<moneyContainer.length ; mi++)
      {
          moneyContainer[mi].draw()
          moneyContainer[mi].update()

          if(mouse.x && mouse.y && isCollide(mouse,moneyContainer[mi]))
            {
              moneyContainer[mi].selected= true
            }
          if(moneyContainer[mi].y<=75)
            {
              money += moneyContainer[mi].amount
              moneyContainer.splice(mi,1)
              mi--
            }
      }
      
}

//FLOATING MESSAGES
class FloatingMessage{
   
   constructor(value,x,y,size,color)
   {
       this.value= value
       this.x= x
       this.y= y
       this.size= size
       this.color= color
       
       this.lifespan=0
       this.opacity= 1
   }
   update()
   {
       this.y -= 0.3
       this.lifespan +=1
       if(this.opacity < 0.01) this.opacity -= 0.01  
   }
   
   draw()
   {
       ctx.globalAlpha= this.opacity
       ctx.fillStyle= this.color
       ctx.font= `${this.size}px Arial`
       ctx.fillText(this.value,this.x,this.y)
   }
  
}

//DISPLAYING AND UPDATING FLOATING MSGS
function displayFloatingMessage()
{
    for(let fi=0; fi<floatingMessage.length ; fi++ )
      {
          floatingMessage[fi].update && floatingMessage[fi].update()
          floatingMessage[fi].draw && floatingMessage[fi].draw()
        
          if(floatingMessage[fi].lifespan >= 50)
            {
                //Delete Float Msg
                floatingMessage.splice(fi,1)
                fi--;
            }
      }
  
}


//DISPLAYING GAME STATUS.......
function displayGameStatus()
{
    ctx.fillStyle= 'gold'
    ctx.font= '30px Arial'  
    ctx.fillText(`SCORE : ${score}`,25,35)
    ctx.fillText(`MONEY : $${money}`,25,75)
  
  
    //GAME-OVER MESSAGE
    if(gameOver)
      {
           ctx.fillStyle= 'black'
           ctx.font= '60px Arial'
           ctx.fillText('GAME OVER',canvasW/4,canvasH/2)
      }
}




//ANIMATE
function animation()
{
    //Clear Game Board
    ctx.clearRect(0,0,canvasW,canvasH)
  
    //Top-Control-Bar
    ctx.fillStyle= "blue"
    ctx.fillRect(0,0,controlBar.width,controlBar.height)
    
    //Display All Grid
    displayGrid()
  
    //Display All Defender
    displayDefender() 
    //Display Each Defenders Bullet  
    displayBullets()
  
    //Display Enemy after 100s
    displayEnemy()
  
    //Displaying Money
    displayMoney()
    
  
    //Game Status
    displayGameStatus()
    //Display Float Msgs
    displayFloatingMessage()
  
  
    //Update Frame
    frame++  
    //Repeat Calls
    if(!gameOver)
    requestAnimationFrame(animation)
}


animation()

//[[ COLLIDE DETECTION ]]
function isCollide(first,second)
{
    if(!(
          first.x >= second.x+second.width ||
          second.x >= first.x+first.width ||
          
          first.y >= second.y+second.height ||
          second.y >= first.y+first.height
    ))
      return true;
  
  return false;
}

//[[UPDATED COLLIDE :- FOR BULLETS]]
function isCollidev1(first,second)
{
    if(!(
          first.x > second.x+second.width ||
          second.x > first.x+first.width ||
          
          first.y > second.y+second.height ||
          second.y > first.y+first.height
    ))
      return true;
  
  return false;
}
