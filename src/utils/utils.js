const bindFunctions = (currentObject, ...functions) =>
    functions.map( (func) => currentObject[func.name] = func.bind(currentObject) );

const fetchResponse = async (url, form = undefined) => {
    const response = form ? await fetch(url, form) : await fetch(url);
    return await response.json();
}

export { bindFunctions, fetchResponse };
