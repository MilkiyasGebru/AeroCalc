export const frequencies: number[] = []
const initial_frequency: number = 0.0019
const final_frequency: number = 3.8950
const delta_frequency: number = 0.0019

let current : number = initial_frequency;

while (current <= final_frequency) {

    frequencies.push(current);
    current += delta_frequency;
}
