export const presetLogos: Record<string, string> = {
  "arch": `       /\\
      /  \\
     /    \\
    /      \\
   /   ,,   \\
  /   |  |   \\
 /_-''    ''-_\\`,
  "debian": `       _,met$$$$$gg.
    ,g$$$$$$$$$$$$$$$P.
  ,g$$P"     """Y$$.".
 ,$$P'              \`$$$.
',$$P       ,ggs.     \`$$b:
\`d$$'     ,$P"'   .    $$$
 $$P      d$'     ,    $$P
 $$:      $$.   -    ,d$$'
 $$;      Y$b._   _,d$P'
 Y$$.    \`.\\"Y$$$$P"'
 \`$$b      "-.__
  \`Y$$
   \`Y$$.
     \`$$b.
       \`Y$$b.
          \`"Y$b._
              \`"""`,
  "ubuntu": `            .-/+oossssoo+/-.
        \`:+ssssssssssssssssss+\`
      -+ssssssssssssssssssyyssss+-
    .ossssssssssssssssssdMMMNysssso.
   /ssssssssssshdmmNNmmyNMMMMhssssss/
  +ssssssssshmydMMMMMMMNddddyssssssss+
 /sssssssshNMMMyhhyyyyhmNMMMNhssssssss/
.ssssssssdMMMNhsssssssssshNMMMdssssssss.
+sssshhhyNMMNyssssssssssssyNMMMysssssss+
ossyNMMMNyMMhsssssssssssssshmmmhssssssso
ossyNMMMNyMMhsssssssssssssshmmmhssssssso
+sssshhhyNMMNyssssssssssssyNMMMysssssss+
.ssssssssdMMMNhsssssssssshNMMMdssssssss.
 \\sssssssshNMMMyhhyyyyhdNMMMNhssssssss/
  +sssssssssdmydMMMMMMMMddddyssssssss+
   \\ssssssssssshdmNNNNmyNMMMMhssssss/
    .ossssssssssssssssssdMMMNysssso.
      -+ssssssssssssssssssyyssss+-
        \`:+ssssssssssssssssss+\`
            .-/+oossssoo+/-.`,
  "fedora": `          /:-------------:\\
       :-------------------::
     :-----------/shhOHbmp---:\\
   /-----------omMMMNNNMMD  ---:
  :-----------sMMMMNMNMP.    ---:
 :-----------:MMMdP-------    ---\\
,------------:MMMd--------    ---:
:------------:MMMd-------    .---:
:----    :---:MMMd-------    ---:
:----    :---:MMMd-------    ---:
:---.    /---:MMMd-------    ---:
:---      ---:MMMd-------    ---:
:---.    /---:MMMd-------    ---:
:---      ---:MMMd-------    ---:
:---.    /---:MMMd-------    ---:
:---      ---:MMMd-------    ---:
:---.    /---:MMMd-------    ---:
:---      ---:MMMd-------    ---:`,
  "windows": `                                ..,
                    ....,,:;+ccllll
      ...,,+:;  cllllllllllllllllll
,cclllllllllll  lllllllllllllllllll
llllllllllllll  lllllllllllllllllll
llllllllllllll  lllllllllllllllllll
llllllllllllll  lllllllllllllllllll
llllllllllllll  lllllllllllllllllll
llllllllllllll  lllllllllllllllllll
                                      
llllllllllllll  lllllllllllllllllll
llllllllllllll  lllllllllllllllllll
llllllllllllll  lllllllllllllllllll
llllllllllllll  lllllllllllllllllll
llllllllllllll  lllllllllllllllllll
\`'ccllllllllll  lllllllllllllllllll
       \`' \\*::  :ccllllllllllllllll
                       \`\`''"*::clll`,
  "apple": `                 .:'
             __ :'__
          .'\`  \`-'  \`\`.
         :          .-'
         :         :
          :         \`-;.
           \`.__.-' .'\`
.             _.'
 \`--...____...-'`
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
