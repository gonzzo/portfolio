export const GATES = {
  AND: { name: 'AND', description: '1 si ambas entradas son 1.', inputs: 2, run: (a, b) => a && b },
  OR: { name: 'OR', description: '1 si al menos una entrada es 1.', inputs: 2, run: (a, b) => a || b },
  XOR: { name: 'XOR', description: '1 si las entradas son diferentes.', inputs: 2, run: (a, b) => a !== b },
  NAND: { name: 'NAND', description: 'Invierte AND: 0 solo si ambas son 1.', inputs: 2, run: (a, b) => !(a && b) },
  NOT: { name: 'NOT', description: 'Invierte una entrada: 0 ↔ 1.', inputs: 1, run: (a) => !a },
  BUF: { name: 'BUF', description: 'Deja pasar la entrada sin cambiarla.', inputs: 1, run: (a) => a },
};
const binary = ['AND', 'OR', 'XOR', 'NAND'];
export const LEVELS = [
  { title: 'Un acuerdo', subtitle: 'Los dos interruptores deben estar encendidos para abrir el paso.', inputs: ['A','B'], nodes: [{ id:'G1', sources:['A','B'], x:510, y:240 }], choices:['AND','OR','XOR'], target:({A,B})=>A&&B, hint:'La salida solo debe ser 1 en la fila A = 1, B = 1.' },
  { title: 'Uno, pero no los dos', subtitle: 'Abre el paso cuando exactamente uno de los interruptores esté encendido.', inputs:['A','B'], nodes:[{ id:'G1',sources:['A','B'],x:510,y:240 }], choices:['AND','OR','XOR'], target:({A,B})=>A!==B, hint:'Busca una puerta que distinga entradas diferentes de entradas iguales.' },
  { title: 'La excepción', subtitle: 'El paso debe abrirse siempre, excepto cuando las dos entradas sean 1.', inputs:['A','B'], nodes:[{ id:'G1',sources:['A','B'],x:510,y:240 }], choices:binary, target:({A,B})=>!(A&&B), hint:'Necesitas el comportamiento contrario a AND.' },
  { title:'Cambiar de idea',subtitle:'Construye el mismo comportamiento del nivel anterior, esta vez en dos etapas.',inputs:['A','B'],nodes:[{id:'G1',sources:['A','B'],x:390,y:240},{id:'G2',sources:['G1'],x:650,y:240}],choices:['AND','OR','XOR','NOT','BUF'],target:({A,B})=>!(A&&B),hint:'Primero detecta si ambas entradas están activas. Después invierte el resultado.' },
  { title:'Permiso de paso',subtitle:'C es el permiso general. Con C encendido, basta con activar A o B.',inputs:['A','B','C'],nodes:[{id:'G1',sources:['A','B'],x:390,y:190},{id:'G2',sources:['G1','C'],x:660,y:260}],choices:binary,target:({A,B,C})=>(A||B)&&C,hint:'Combina A y B con una puerta inclusiva. El resultado necesita también el permiso C.' },
  { title:'Equilibrio impar',subtitle:'El paso se abre con un número impar de entradas encendidas: una o las tres.',inputs:['A','B','C'],nodes:[{id:'G1',sources:['A','B'],x:390,y:190},{id:'G2',sources:['G1','C'],x:660,y:260}],choices:binary,target:({A,B,C})=>(Number(A)+Number(B)+Number(C))%2===1,hint:'Una puerta que compara diferencias puede encadenarse para calcular la paridad.' },
  { title:'Dos caminos',subtitle:'Abre si A y B están encendidos, o si B y C están encendidos. Una ruta basta.',inputs:['A','B','C'],nodes:[{id:'G1',sources:['A','B'],x:390,y:160},{id:'G2',sources:['B','C'],x:390,y:330},{id:'G3',sources:['G1','G2'],x:680,y:245}],choices:binary,target:({A,B,C})=>(A&&B)||(B&&C),hint:'Cada rama comprueba un par de entradas. La última puerta reúne ambas rutas.' },
  { title:'La mayoría decide',subtitle:'El último paso: la salida debe ser 1 cuando al menos dos de las tres entradas sean 1.',inputs:['A','B','C'],nodes:[{id:'G1',sources:['A','B'],x:320,y:150},{id:'G2',sources:['A','B'],x:320,y:300},{id:'G3',sources:['G2','C'],x:555,y:300},{id:'G4',sources:['G1','G3'],x:770,y:230}],choices:binary,target:({A,B,C})=>Number(A)+Number(B)+Number(C)>=2,hint:'Una rama puede detectar A y B juntos. La otra detecta exactamente uno de ellos y exige C. Reúne las dos posibilidades.' },
];
export function combinations(inputs) {
  return Array.from({length:2**inputs.length},(_,row)=>Object.fromEntries(inputs.map((key,i)=>[key,Boolean((row>>(inputs.length-i-1))&1)])));
}
export function evaluate(level, placements, input) {
  const values={...input};
  for(const node of level.nodes) {
    const gate=GATES[placements[node.id]];
    const args=node.sources.map(source=>values[source]);
    values[node.id]=gate && gate.inputs===node.sources.length && args.every(value=>typeof value==='boolean') ? Boolean(gate.run(...args)) : null;
  }
  return { values, output:values[level.nodes.at(-1).id] };
}
export function checkCircuit(level, placements) {
  return combinations(level.inputs).map(input=>{
    const {output}=evaluate(level,placements,input);
    const target=Boolean(level.target(input));
    return {input,output,target,pass:output===target};
  });
}
