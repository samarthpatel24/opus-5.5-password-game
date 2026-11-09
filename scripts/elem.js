// sums atomic numbers: two-letter symbol first, else one-letter
const E='H He Li Be B C N O F Ne Na Mg Al Si P S Cl Ar K Ca Sc Ti V Cr Mn Fe Co Ni Cu Zn Ga Ge As Se Br Kr Rb Sr Y Zr Nb Mo Tc Ru Rh Pd Ag Cd In Sn Sb Te I Xe Cs Ba La Ce Pr Nd Pm Sm Eu Gd Tb Dy Ho Er Tm Yb Lu Hf Ta W Re Os Ir Pt Au Hg Tl Pb Bi Po At Rn Fr Ra Ac Th Pa U Np Pu Am Cm Bk Cf Es Fm Md No Lr Rf Db Sg Bh Hs Mt Ds Rg Cn Nh Fl Mc Lv Ts Og'.split(' ');
const s=process.argv[2];let t=0,f=[];for(let i=0;i<s.length;i++){const two=s.slice(i,i+2),one=s[i];if(E.includes(two)){t+=E.indexOf(two)+1;f.push(two);i++}else if(E.includes(one)){t+=E.indexOf(one)+1;f.push(one)}}
const d=[...s].filter(c=>/\d/.test(c)).reduce((a,c)=>a+ +c,0);
console.log('elements',t,f.join(','),'| digitsum',d,'| roman',s.match(/[MDCLXVI]+/g));
