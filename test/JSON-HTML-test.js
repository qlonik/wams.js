var j0 = '<div id="test" class="test" data-custom="testing"><a href="google.com">Google</a></div>',
   j1 = JSON.stringify([
      {
         tag: 'div',
         attr: {
            id: 'test2',
            class: ['test', 'div', 'class'],
            'data-mine': 123
         },
         inner: '<div data-test="hi">Hello</div>'
      },
      {
         tag: 'div',
         inner: {
            tag: 'h1',
            inner: 'Hello'
         }
      },
      '<div><div><h2>Hi again</h2></div></div>'
   ]),
   j2 = {
      data: [
         "<!-- Comment -->",
         "Hello",
         {
            t: 'div',
            a: {
               id: 'test3',
               class: 'div class test'
            },
            s: {
               'background-color': 'yellow'
            },
            i: [
               '<div><div id="inner"><a href="youtube.com" class="a">youtube</a></div></div>',
               {
                  t: 'a',
                  a: {
                     id: 'link-test1',
                     href: 'github.com'
                  },
                  i: 'Github'
               }
            ]
         },
         '<div id="test4">Hello again</div>'
      ],
      opts: {
         tag: 't',
         attr: 'a',
         style: 's',
         inner: 'i'
      }
   };

window.JSON2HTML = WAMS.JSON2HTML;
window.j0 = j0;
window.j1 = j1;
window.j2 = j2;

console.log('j0');
//console.log(j0);
console.log(JSON2HTML(j0));
console.log('j1');
//console.log(j1);
console.log(JSON2HTML(j1));
console.log('j2');
//console.log(j2);
console.log(JSON2HTML(j2, { tag: 't', attr: 'a' }));


var h0 = JSON2HTML(j0),
   h1 = JSON2HTML(j1),
   h2 = JSON2HTML(j2, { tag: 't', attr: 'a' });

window.HTML2JSON = WAMS.HTML2JSON;
window.h0 = h0;
window.h1 = h1;
window.h2 = h2;

console.log('h0');
//console.log(h0);
console.log(HTML2JSON(h0));
console.log('h1');
//console.log(h1);
console.log(HTML2JSON(h1));
console.log('h2');
//console.log(h2);
console.log(HTML2JSON(h2, { tag: 't', attr: 'a', style: 's', inner: 'i' }));

var div = document.createElement('div');
div.innerHTML = 'text<div>more text</div>';

window.myDiv = div;