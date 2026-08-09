export interface WindTunnelSource {
    dataset: string;
    citation: string;
    link: string;
}

const SOURCES: { minId: number; maxId: number; source: WindTunnelSource }[] = [
    {
        minId: 1,
        maxId: 24,
        source: {
            dataset: "Data set 1",
            citation:
                "Wang, J., and G.A. Kopp. 2021. Comparisons of aerodynamic data with the main wind force-resisting system provisions of ASCE 7-16. II: Mid- and high-rise buildings. Journal of Structural Engineering 147 (3): 04020348.",
            link: "https://doi.org/10.1061/(ASCE)ST.1943-541X.0002922",
        },
    },
    {
        minId: 25,
        maxId: 46,
        source: {
            dataset: "Data set 2",
            citation: "TPU (Tokyo Polytechnic University). Aerodynamic Database. 2025.",
            link: "https://db.wind.arch.t-kougei.ac.jp/",
        },
    },
    {
        minId: 47,
        maxId: 56,
        source: {
            dataset: "Data set 3",
            citation:
                "Bezabeh, M.A., G.T. Bitsuamlak, M. Popovski, and S. Tesfamariam. 2020. Dynamic response of tall mass-timber buildings to wind excitation. Journal of Structural Engineering 146 (10): 04020199.",
            link: "https://doi.org/10.1061/(ASCE)ST.1943-541X.0002746",
        },
    },
    {
        minId: 57,
        maxId: 57,
        source: {
            dataset: "Data set 4",
            citation:
                "Park, S., E. Simiu, and D.H. Yeo. 2019. Equivalent static wind loads vs. database-assisted design of tall buildings: An assessment. Engineering Structures 186 (May): 553–563.",
            link: "https://doi.org/10.1016/j.engstruct.2019.02.021",
        },
    },
];

export function getWindTunnelSource(buildingId: number): WindTunnelSource | null {
    const match = SOURCES.find(({ minId, maxId }) => buildingId >= minId && buildingId <= maxId);
    return match ? match.source : null;
}
