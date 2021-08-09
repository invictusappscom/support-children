export const ethDisplay = (price) => {
    price = price / 1000000000000000000
    return price
}

export const trimText = (input, size) => {
    if (input.length > size) {
        return input.substring(0, size) + '...';
    }
    return input;
}

export const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}