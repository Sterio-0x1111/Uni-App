import { defineStore } from 'pinia';
import axios from 'axios';
import { ref } from 'vue';

const iconBaseURL = '/assets/icons';

export const useMensaStore = defineStore('mensa', {
    
    state: () => ({
        mensas: [
            { id: 1, name: "Hagen", url: "https://www.stwdo.de/mensa-cafes-und-catering/fh-suedwestfalen/hagen" },
            { id: 2, name: "Iserlohn", url: "https://www.stwdo.de/mensa-cafes-und-catering/fh-suedwestfalen/iserlohn" },
            { id: 3, name: "Meschede", url: "https://www.stwdo.de/mensa-cafes-und-catering/fh-suedwestfalen/meschede" },
            { id: 4, name: "Soest", url: "https://www.stwdo.de/mensa-cafes-und-catering/fh-suedwestfalen/soest" }
        ],
        categoryIcons: {
            'Tagesgericht': iconBaseURL + '/icon-tagesgericht.png',
            'Aktionsteller': iconBaseURL + '/icon-aktionsteller.png',
            'Menü 1':        iconBaseURL + '/icon-menue-1.png',
            'Menü 2':        iconBaseURL + '/icon-menue-2.png',
            'Klimateller':   iconBaseURL + '/icon-bite.png',
            'Vegetarisches Menü': iconBaseURL + '/icon-veggie-menue.png',
            'Ohne Fleisch': iconBaseURL + '/icon-vegetarisch.png',
            'Vegane Speise': iconBaseURL + '/icon-vegan.png',
            'Mit Fisch bzw. Meeresfrüchten': iconBaseURL + '/icon-fisch.png',
            'Mit Rindfleisch': iconBaseURL + '/icon-rind.png',
            'Mit Geflügel': iconBaseURL + '/icon-gefluegel.png',
            'Mit Schweinefleisch': iconBaseURL + '/icon-schwein.png',
            'Beilagen': iconBaseURL + '/icon-beilagen.png',
            'Fleisch aus artgerechter Haltung': iconBaseURL + 'icon-artgerechte-haltung.png'
        },

    }),
    actions: {

    },
    persist: {
        storage: sessionStorage,
    }
})