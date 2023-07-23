const randomArr=['0','1','2','3','4','5','6','7','8','9','a','b','c','d','e','f'];
function randomColor(){
    //颜色字符串
    let colorStr="#";
    //字符串的每一字符的范围
    //产生一个六位的字符串
    for(let i=0;i<6;i++){
      //15是范围上限，0是范围下限，两个函数保证产生出来的随机数是整数
      colorStr+=randomArr[Math.ceil(Math.random()*(15-0)+0)];
    }
    return colorStr;
}
function randomSize(){
  return Math.floor(Math.random()*5)+20;
}

function log(...args){
  const content=args.slice(1);
  const size=randomSize();
  const color=randomColor();
  const bgColor=randomColor(); 
  console.log(`%c${args[0]}`, `color:${color};font-size:${size}px;background-color:${bgColor};`,...content)
}
export {log}