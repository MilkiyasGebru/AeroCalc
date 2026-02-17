export const frequencies: number[] = []
const initial_frequency: number = 0.001877739375104
const final_frequency: number = initial_frequency*2050
const delta_frequency: number = 0.001877739375104

// const initial_frequency: number = 0.001
// const final_frequency: number = 5.001
// const delta_frequency: number = 0.001

let current : number = initial_frequency;

while (current <= final_frequency) {

    frequencies.push(current);
    current += delta_frequency;
}
