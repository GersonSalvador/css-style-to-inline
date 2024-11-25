const html = document.getElementById('html');
const css = document.getElementById('css');
const result = document.getElementById('result');

function handlePropertyValue(valueArray) {
  return valueArray.reduce((acc, cur) => {
    const [key, value] = cur.split(':');
    return {...acc, [key]:value.trim()};
  }, {});

}
function selectorSort(obj) {
  obj.sort((a,b) => {
    return a[0].split(' ').length - b[0].split(' ').length;
  })
  return obj;
}
function exportCode() {
  const doc = result.contentDocument || result.contentWindow.document;
  const htmlCode = doc.documentElement.outerHTML;
  const blob = new Blob([htmlCode], {type: 'text/plain'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'index.html';
  a.click();
  URL.revokeObjectURL(url);
}
css.addEventListener('keyup', () => {
  if(!css.value) return;
  const cssCompleteCode = css.value.replace(/\n/g, '').split('}').reduce((acc, item) => {
    const [selector, properties] = item.split('{');
    const trimedSelector = selector.trim();
    if (trimedSelector && properties) {
      const reducedProperties = properties.split(';').reduce((acc, item) => {
        const [untrimedKey, value] = item.split(':');
        const key = untrimedKey.trim();
        if (key && value) {
          acc.push(`${key}:${value.trim()}`);
        }
        return acc;
      }, []);
      acc.push([trimedSelector,reducedProperties]);
    }
    return acc;
  }, []);
  console.log({cssCompleteCode, sort: selectorSort(cssCompleteCode)});
  const rootIndex = selectorSort(cssCompleteCode).findIndex(([key]) => key === ':root');
  const root = cssCompleteCode[rootIndex];
  root[1] = handlePropertyValue(root[1]);
  const cssCode = cssCompleteCode
    .filter((_, index) => index !== rootIndex)
    .map(([key, propertiesValues]) => {
      return [key,propertiesValues.map(property => {
        return property.replace(/var\(\-\-[\w\-D]{1,}\)/g, (match) => {
          return `${root[1][match.replace('var(','').replace(')','')]}`;
        });
      })
      ]
    })
    const doc = result.contentDocument || result.contentWindow.document;
    doc.open();
    doc.write(html.value);
    doc.close();
    cssCode.forEach(([key, properties]) => {
      const elements = doc.querySelectorAll(key);
      elements.forEach(element => {
        const {tagName, parentElement} = element;
        if(parentElement && ['head', 'html'].every(i => tagName.toLowerCase() !== i) && parentElement?.tagName?.toLowerCase() !== 'head') {
          properties.forEach(property => {
            const [key, value] = property.split(':');
            element.style[key] = value;
          })
        }
      })
    })
});