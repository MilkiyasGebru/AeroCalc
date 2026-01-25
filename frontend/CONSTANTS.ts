export const frequencies: number[] = []
const initial_frequency: number = 0.001877739375104
const final_frequency: number = initial_frequency*2050
const delta_frequency: number = 0.001877739375104

let current : number = initial_frequency;

while (current <= final_frequency) {

    frequencies.push(current);
    current += delta_frequency;
}
