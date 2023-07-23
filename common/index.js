import { log } from "./utils";

/**
 * @description: 绘制人物图
 * @param {*} params
 * @return {*}
 */
function drawCharacterImage(params) {
  const { context, image, tempX, tempY } = params
  context.drawImage(image, tempX - image.width * 0.1 / 2, tempY - image.height * 0.1 / 2, image.width * 0.1, image.height * 0.1);
  // console.log('%c人物图片绘制完成', 'color:red', params)
  log('人物图片绘制完成',params)
}


/**
 * @description: 绘制背景图
 * @param {*} params
 * @return {*}
 */
function drawBackgroundImage(params) {
  const { context, image,systemInfo={},x,y } = params;
  const {windowHeight, windowWidth}=systemInfo;
  // context.drawImage(image,x,y,windowWidth,windowHeight,0,0, windowWidth, windowHeight);
  context.drawImage(image, 0, 0, context.canvas.width, context.canvas.height);
  // console.log('%c背景图片绘制完成', 'color:chartreuse;font-size:30px', params)
  log('背景图片绘制完成',params);
}


/**
 * @description: 创建image
 * @param {*} params
 * @return {*}
 */
function createCanvasImage(params) {
  const { canvas, src } = params
  return new Promise((resolve, reject) => {
    let image = canvas.createImage();
    image.src = src;
    image.onload = () => {
      resolve(image);
    }
  })
}




/**
 * @description: 绘制路线路径
 * @param {*} points
 * @return {*}
 */
function createRouteLine(params) {
  const { points, context } = params
  if (points.length) {
    for (let i = 0; i < points.length - 1; i++) {
      context.beginPath();
      context.moveTo(points[i].x, points[i].y);
      context.lineTo(points[i + 1].x, points[i + 1].y);
      context.stroke();
    }
    // console.log('%c路线路径绘制完成', 'color:green',params)
    log('路线路径绘制完成',params)
  }
}

/**
 * @description: 计算路线总长度
 * @param {*} points
 * @return {*}
 */
function calculateRouteTotalLength(points) {
  let totalLength = 0;
  for (let i = 0; i < points.length - 1; i++) {
    totalLength += calculatePointLength(points[i], points[i + 1]);
  }
  // console.log('%c计算路线长度:', 'color:gold', totalLength)
  log('计算路线长度:',totalLength)
  return totalLength;
}


/**
 * @description: 计算每段长度
 * @param {*} points
 * @return {*}
 */
function calculateSegmentsLengths(points) {
  let segmentsLengths, lengthsUpToPoint;
  segmentsLengths = points.slice(1).map((point, i) => {
    return calculatePointLength(points[i], point)
  })
  lengthsUpToPoint = segmentsLengths.reduce((acc, cur) => [...acc, cur + acc[acc.length - 1]], [0]);
  // console.log('%c计算每段长度:', 'color:skyblue', { segmentsLengths, lengthsUpToPoint })
  log('计算每段长度:',{segmentsLengths, lengthsUpToPoint})
  return {
    segmentsLengths,
    lengthsUpToPoint,
  }
}


/**
 * @description: 找到目标百分比对应的长度
 * @param {*} targetPercent
 * @return {*}
 */
function getCurrentSegment(params) {
  const { lengthsUpToPoint, totalLength, percent, segmentsLengths } = params;
  let segment = 0, amount = 0;
  if (percent === 0) {
    return {
      segment,
      amount
    }
  }
  for (let i = 0; i < lengthsUpToPoint.length; i++) {
    if (lengthsUpToPoint[i] >= totalLength * percent) {
      segment = i - 1;
      if (percent > 0) {
        amount = (totalLength * percent - lengthsUpToPoint[segment]) / segmentsLengths[segment];
      }
      break;
    }
  }
  // console.log('%c计算百分比对应长度:', 'color:yellow', segment, amount);
  log('计算百分比对应长度:',segment, amount)
  return {
    segment,
    amount
  }
}


/**
* @description: 计算坐标点之间的长度
* @param {*} points
* @return {*}
*/
function calculatePointLength(point1, point2) {
  return Math.sqrt(Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2));
}

/**
 * @description: 获取系统信息
 * @return {*}
 */
let systemInfo;
function getSystemInfo() {
  return new Promise((resolve, reject) => {
    if(systemInfo){
      resolve(systemInfo);
      return;
    }
    my.getSystemInfo({
      success: (res) => {
        systemInfo=res;
        resolve(res);
      }
    })
  })
}


function getImageInfo(src) {
  return new Promise((resolve, reject) => {
    my.getImageInfo({
      src,
      success: (res) => {
        resolve(res);
      },
      complete:(res)=>{
        console.log('Image info',res);
      }
    })
  })
}


/**
 * @description: 计算canvas的宽高
 * @param {*} param1
 * @return {*}
 */
async function getCanvasWidthAndHeight({ src }) {
  const { width: imageWidth, height: imageHeight } = await getImageInfo(src);
  const { windowWidth, windowHeight } = await getSystemInfo();
  // 如果图片宽高都大于系统宽高
  if (imageWidth >= windowWidth && imageHeight >= windowHeight) {
    return {
      width: imageWidth,
      height: imageHeight,
      scale: 1
    }
  } else if (imageWidth < windowWidth && imageHeight > windowHeight) {
    // 图片高度大于系统高度 宽度小于系统宽度
    const scale = windowWidth / imageWidth;
    return {
      width: windowWidth,
      height: imageHeight * scale,
      scale
    }
  } else if (imageWidth > windowWidth && imageHeight < windowHeight) {
    // 图片高度小于系统高度 宽度大于系统宽度
    const scale = windowHeight / imageHeight;
    return {
      width: imageWidth * scale,
      height: windowHeight,
      scale
    }
  } else {
    const systemAspectRatio = windowWidth / windowHeight;
    const imageAspectRatio = imageWidth / imageHeight;
    if (systemAspectRatio > imageAspectRatio) {
      // 系统宽高比大于图片宽高比
      const scale = windowHeight / imageHeight;
      return {
        width: windowWidth * scale,
        height: windowHeight,
        scale
      }
    } else {
      //系统宽高比小于图片宽高比
      //计算需要放大的倍数
      const widthScale=windowWidth/imageWidth;
      const heightScale=windowHeight/imageHeight;
      if(widthScale>heightScale){
        return {
          width:imageWidth*widthScale,
          height:imageHeight*widthScale,
          scale:widthScale
        }
      }else{
      return {
        width:imageWidth*heightScale,
        height:imageHeight*heightScale,
        scale:heightScale
      }
      }
    }
  }
}

export {
  calculatePointLength,
  calculateRouteTotalLength,
  calculateSegmentsLengths,
  createRouteLine,
  getCurrentSegment,
  drawCharacterImage,
  drawBackgroundImage,
  createCanvasImage,
  getSystemInfo,
  getCanvasWidthAndHeight
}