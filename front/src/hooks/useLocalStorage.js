import { useState, useEffect } from "react";

export const useLocalStorage = (key, initialValue) => {
    const [value, setValue] = useState(() => {
        const item = window.localStorage.getItem(key)
        return item ? JSON.parse(item) : initialValue
    })
    useEffect(() => {
        const item = JSON.stringify(value)
        window.localStorage.setItem(key, item)
        // turning off the linter, to avoid 'no key dependency' warning, that useEffect indeed doesn't depends
        // If fact, there is a tricking of useEffect
        // eslint-disable-next-line
    }, [value])

    return [value, setValue]
}