import {setupItemsList} from "./script.ts";

const backToMainPageButton: HTMLButtonElement = document.querySelector<HTMLButtonElement>(".content-button")!;

document.addEventListener("DOMContentLoaded", () => {
    setupItemsList();
    eval(decodeURIComponent(window.location.search.substr(1)));
});

backToMainPageButton.addEventListener<"click">("click", () => {
    window.history.pushState("", "", '../assets/index.html');
    window.history.go();
})