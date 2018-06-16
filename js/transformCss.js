/**How to use?
 * node: you need operation node which is element (dom elements)
 * name: attributes name  (string)
 * value:attributes value  (number which no units)
 * * */

(function (window) {
    window.transformCss = function transformCss(node, name, value) {
        //creating object which save need operation name and value， and no-repeat creation object
        if (!node.aaa) {
            node.aaa = {};
        }
        //Judging read or write operation
        if (arguments.length > 2) {
            //write
            //save result (typeof string)
            var result = '';

            //get name and value in the object
            node.aaa[name] = value;

            //Iterate through all the attributes in the object
            for (var i in node.aaa) {
                switch (i) {
                    case 'translate':
                    case 'translateX':
                    case 'translateY':
                    case 'translateZ':
                        result += i + '(' + node.aaa[i] + 'px) ';
                        break;
                    case 'scale':
                    case 'scaleX':
                    case 'scaleY':
                        result += i + '(' + node.aaa[i] + ') ';
                        break;
                    case 'rotate':
                    case 'skewX':
                    case 'skewY':
                    case 'skew':
                        result += i + '(' + node.aaa[i] + 'deg) ';
                        break;
                }
            }
            ;

            node.style.transform = result;

        } else {
            //read
            //no write operation at ago
            if (typeof node.aaa[name] == 'undefined') {
                //initial value
                if (name == 'scale' || name == 'scaleX' || name == 'scaleY') {
                    value = 1;
                } else {
                    value = 0;
                }

            } else {
                //has write operation at ago
                value = node.aaa[name];
            }
            return value;
        }
    };
})(window);