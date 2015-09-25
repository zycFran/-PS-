/**
 * Created by zhouyc on 2015/9/16.
 */
var ColorPicker = (function () {
    function ColorPicker(canvas, img) {
        this.imageObj = null;
        this.canvas = canvas;
    }

    ColorPicker.prototype = {

        init: function (imageObj, sizeObj) {
            var me = this;
            var padding = 0;

            var offsetY = 32;

            var canvas = me.canvas;
            var context = canvas.getContext('2d');
            var mouseDown = false;

            me.context = context;
            me.imageObj = imageObj;


            context.strokeStyle = '#444';
            context.lineWidth = 2;

            canvas.removeEventListener("mousedown", mouseDownHandler);
            canvas.removeEventListener("mouseup", mouseUpHandler);

            canvas.addEventListener('mousedown', mouseDownHandler, false);
            canvas.addEventListener('mouseup', mouseUpHandler, false);

            context.drawImage(imageObj, sizeObj.left, sizeObj.top, Number(sizeObj.width), Number(sizeObj.height));

            // 缓存原始图片的数据
            me.originImageData = context.getImageData(padding, padding, imageObj.width, imageObj.height);

            //context.clearRect(0, 0, canvas.width, canvas.height);

            function mouseDownHandler(evt) {
                mouseDown = true;
                var mousePos = me.getMousePos(canvas, evt);
                //var imageData = context.getImageData(padding, padding, imageObj.width, imageObj.height);

                var data = me.originImageData.data;
                var x = mousePos.x - padding;
                var y = mousePos.y - padding + offsetY;
                var red = data[((imageObj.width * y) + x) * 4];
                var green = data[((imageObj.width * y) + x) * 4 + 1];
                var blue = data[((imageObj.width * y) + x) * 4 + 2];
                var color = 'rgb(' + red + ',' + green + ',' + blue + ')';

                var colorText = me.rgbToHex(red, green, blue);
                var rgb = [red, green, blue];

                me.drawColorSquare(canvas, color, colorText, rgb);
            }

            function mouseUpHandler() {
                mouseDown = false;
            }

        },

        getMousePos: function (canvas, evt) {
            var rect = canvas.getBoundingClientRect();
            return {
                x: evt.clientX - rect.left,
                y: evt.clientY - rect.top
            };
        },

        setImage: function (imageSrc, left, top, width, height) {
            var me = this;
            var img = new Image();

            me.context.clearRect(0, 0, me.canvas.width, me.canvas.height);

            img.onload = function () {
                me.context.drawImage(img, Number(left), Number(top), Number(width), Number(height));
                me.imageObj = img;

                pickerCtr.waiting = false;
            };
            img.src = imageSrc;
        },

        drawColorSquare: function (canvas, color, colorText, rgb) {
            var me = this;
            if (me.afterPickColor && typeof me.afterPickColor == 'function') {
                me.afterPickColor(color, colorText, rgb);
                return;
            }
            return color;
        },

        rgbToHex: function (r, g, b) {
            var me = this;
            return "#" + me.componentToHex(r) + me.componentToHex(g) + me.componentToHex(b);
        },

        componentToHex: function componentToHex(c) {
            var hex = c.toString(16);
            return hex.length == 1 ? "0" + hex : hex;
        },

        afterPickColor: null
    };

    return ColorPicker;
})();

var colorPicker;
var targetImageWidth = 0;
var targetImageHeight = 0;
var sizeObj;

var curColorMD5 = "#######_" + Math.random();

var pickerCtr = avalon.define({
    $id: 'PickerController',

    pickColor: null,
    pickColorText: "#######",
    pickColorRGB: [],

    animate: true,
    check: false,
    imageSrc: '',

    checkHandler: function () {
        pickerCtr.check = !pickerCtr.check;
        if (!pickerCtr.check) {
            pickerCtr.animate = false;
            pickerCtr.pickColor = "rgb(0,0,0)";
            pickerCtr.pickColorText = "#######";
            pickerCtr.pickColorRGB = [];

            pickerCtr.pickHandler();
        }
    },
    init: function () {
        var src = "images/test.jpg";

        var img = new Image();

        pickerCtr.imageSrc = src;

        img.onload = function () {
            targetImageWidth = img.width;
            targetImageHeight = img.height;

            sizeObj = {
                width: img.width,
                height: img.height,
                top: 0,
                left: 0
            };

            colorPicker = new ColorPicker(document.getElementById("ColorCanvas"));
            colorPicker.afterPickColor = function (color, colorText, rgb) {
                if (!pickerCtr.check) {
                    return;
                }
                pickerCtr.animate = false;
                pickerCtr.pickColor = color;
                pickerCtr.pickColorText = colorText;
                pickerCtr.pickColorRGB = rgb;

                pickerCtr.pickHandler();

                setTimeout(function () {
                    pickerCtr.animate = true;
                }, 200)
            };

            colorPicker.init(img, sizeObj);
        };
        img.src = src;
    },

    pickHandler: function () {
        curColorMD5 = pickerCtr.pickColorText + "_" + Math.random();
    }
});

pickerCtr.init();

avalon.scan();

