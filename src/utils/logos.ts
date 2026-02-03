export const presetLogos: Record<string, string> = {
  "arch": \`                   -
                 .o+
                .ooo/
               .ooooo:
              .ooooooo:
              -+oooooo+:
            ./:-:++oooo+:
           ./++++/+++++++:
          ./++++++++++++++:
         ./+++ooooooooooooo/
        ./ooosssso++osssssso+
       .oossssso-\`\`\`\`/ossssss+
      -osssssso.      :ssssssso.
     :osssssss/        osssso+++.
    /ossssssss/        +ssssooo/-
  ./ossssso+/:-        -:/+osssso+-
 .sso+:-                 .-/+oso:
.++:.                           -/+/
.                                 /\`,
  "debian": \`       _,met$$$$$$$$$$gg.
    ,g$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$P.
  ,g$$$$P""       """Y$$$$.".
 ,$$$$P'              \`$$$$$$.
',$$$$P       ,ggs.     \`$$$$b:
\`d$$$$'     ,$P"'   .    $$$$$$
 $$$$P      d$'     ,    $$$$P
 $$$$:      $$$.   -    ,d$$$$'
 $$$$;      Y$b._   _,d$P'
 Y$$$$.    \`.\`"Y$$$$$$$$P"'
 \`$$$$b      "-.__
  \`Y$$$$b
   \`Y$$$$.
     \`$$$$b.
       \`Y$$$$b.
         \`"Y$$b._
             \`""""\`,
  "ubuntu": \`                             ....
              .',:clooo:  .:looooo:.
           .;looooooooc  .oooooooooo'
        .;looooool:,''.  :ooooooooooc
       ;looool;.         'oooooooooo,
      ;clool'             .cooooooc.  ,,
         ...                ......  .:oo,
  .;clol:,.                        .loooo'
 :ooooooooo,                        'ooool
'ooooooooooo.                        loooo.
'ooooooooool                         coooo.
 ,loooooooc.                        .loooo.
   .,;;;'.                          ;ooooc
       ...                         ,ooool.
    .cooooc.              ..',,'.  .cooo.
      ;ooooo:.           ;oooooooc.  :l.
       .coooooc,..      coooooooooo.
         .:ooooooolc:. .ooooooooooo'
           .':loooooo;  ,oooooooooc
               ..';::c'  .;loooo:'\`,
  "fedora": \`             .',;::::;,'.
         .';:cccccccccccc:;,.
      .;cccccccccccccccccccccc;.
    .:cccccccccccccccccccccccccc:.
  .;ccccccccccccc;.:dddl:.;ccccccc;.
 .:ccccccccccccc;OWMKOOXMWd;ccccccc:.
.:ccccccccccccc;KMMc;cc;xMMc;ccccccc:.
,cccccccccccccc;MMM.;cc;;WW:;cccccccc,
:cccccccccccccc;MMM.;cccccccccccccccc:
:ccccccc;oxOOOo;MMM000k.;cccccccccccc:
cccccc;0MMKxdd:;MMMkddc.;cccccccccccc;
ccccc;XMO';cccc;MMM.;cccccccccccccccc'
ccccc;MMo;ccccc;MMW.;ccccccccccccccc;
ccccc;0MNc.ccc.xMMd;ccccccccccccccc;
cccccc;dNMWXXXWM0:;cccccccccccccc:,
cccccccc;.:odl:.;cccccccccccccc:,.
ccccccccccccccccccccccccccccc:'.
:ccccccccccccccccccccccc:;,..
 ':cccccccccccccccc::;,.\`,
  "windows": \`/////////////////  /////////////////
/////////////////  /////////////////
/////////////////  /////////////////
/////////////////  /////////////////
/////////////////  /////////////////
/////////////////  /////////////////
/////////////////  /////////////////
/////////////////  /////////////////

/////////////////  /////////////////
/////////////////  /////////////////
/////////////////  /////////////////
/////////////////  /////////////////
/////////////////  /////////////////
/////////////////  /////////////////
/////////////////  /////////////////
/////////////////  /////////////////\`,
  "apple": \`                     ..'
                 ,xNMM.
               .OMMMMo
               lMM"
     .;loddo:.  .olloddol;.
   cKMMMMMMMMMMNWMMMMMMMMMM0:
 .KMMMMMMMMMMMMMMMMMMMMMMMWd.
 XMMMMMMMMMMMMMMMMMMMMMMMX.
;MMMMMMMMMMMMMMMMMMMMMMMM:
:MMMMMMMMMMMMMMMMMMMMMMMM:
.MMMMMMMMMMMMMMMMMMMMMMMMX.
 kMMMMMMMMMMMMMMMMMMMMMMMMWd.
 'XMMMMMMMMMMMMMMMMMMMMMMMMMMk
  'XMMMMMMMMMMMMMMMMMMMMMMMMK.
    kMMMMMMMMMMMMMMMMMMMMMMd
     ;KMMMMMMMWXXWMMMMMMMk.
       "cooc*"    "*coo'"\`
};

export const getLogoColor = (name: string): string => {
  switch (name) {
    case 'arch': return 'text-blue-500';
    case 'debian': return 'text-red-500';
    case 'ubuntu': return 'text-orange-500';
    case 'fedora': return 'text-blue-600';
    case 'windows': return 'text-blue-400';
    case 'apple': return 'text-gray-400';
    default: return 'text-gray-200';
  }
};
