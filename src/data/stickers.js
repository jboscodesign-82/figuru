// ~120 figurinhas de 10 seleções — Copa 2026
const mkTeam = (code, name, flag, players) =>
  players.map((p, i) => ({
    id:       `${code}${String(i + 1).padStart(3, '0')}`,
    code:     `${code}${String(i + 1).padStart(3, '0')}`,
    name:     p.name,
    position: p.pos,
    number:   p.num,
    team:     name,
    teamCode: code,
    flag,
  }))

const BRA = mkTeam('BRA', 'Brasil', '🇧🇷', [
  { name: 'Alisson',        pos: 'GK', num: 1  },
  { name: 'Ederson',        pos: 'GK', num: 23 },
  { name: 'Danilo',         pos: 'DF', num: 2  },
  { name: 'Marquinhos',     pos: 'DF', num: 4  },
  { name: 'Éder Militão',   pos: 'DF', num: 3  },
  { name: 'Gabriel Magalhães', pos: 'DF', num: 5  },
  { name: 'Renan Lodi',     pos: 'DF', num: 6  },
  { name: 'Casemiro',       pos: 'MF', num: 5  },
  { name: 'Bruno Guimarães',pos: 'MF', num: 8  },
  { name: 'Lucas Paquetá',  pos: 'MF', num: 10 },
  { name: 'Rodrygo',        pos: 'FW', num: 11 },
  { name: 'Vinicius Jr',    pos: 'FW', num: 7  },
])

const ARG = mkTeam('ARG', 'Argentina', '🇦🇷', [
  { name: 'Emiliano Martínez', pos: 'GK', num: 23 },
  { name: 'Nahuel Molina',     pos: 'DF', num: 26 },
  { name: 'Lisandro Martínez', pos: 'DF', num: 5  },
  { name: 'Cristian Romero',   pos: 'DF', num: 13 },
  { name: 'Nicolás Otamendi',  pos: 'DF', num: 19 },
  { name: 'Marcos Acuña',      pos: 'DF', num: 8  },
  { name: 'Rodrigo De Paul',   pos: 'MF', num: 7  },
  { name: 'Leandro Paredes',   pos: 'MF', num: 5  },
  { name: 'Alexis Mac Allister',pos: 'MF', num: 20 },
  { name: 'Ángel Di María',    pos: 'FW', num: 11 },
  { name: 'Lautaro Martínez',  pos: 'FW', num: 22 },
  { name: 'Lionel Messi',      pos: 'FW', num: 10 },
])

const FRA = mkTeam('FRA', 'França', '🇫🇷', [
  { name: 'Mike Maignan',      pos: 'GK', num: 16 },
  { name: 'Jules Koundé',      pos: 'DF', num: 5  },
  { name: 'Raphaël Varane',    pos: 'DF', num: 4  },
  { name: 'Dayot Upamecano',   pos: 'DF', num: 15 },
  { name: 'Theo Hernández',    pos: 'DF', num: 22 },
  { name: 'N\'Golo Kanté',     pos: 'MF', num: 13 },
  { name: 'Aurélien Tchouaméni',pos: 'MF', num: 8 },
  { name: 'Antoine Griezmann', pos: 'MF', num: 7  },
  { name: 'Ousmane Dembélé',   pos: 'FW', num: 11 },
  { name: 'Marcus Thuram',     pos: 'FW', num: 9  },
  { name: 'Kylian Mbappé',     pos: 'FW', num: 10 },
  { name: 'Olivier Giroud',    pos: 'FW', num: 18 },
])

const ENG = mkTeam('ENG', 'Inglaterra', '🏴󠁧󠁢󠁥󠁮󠁧󠁿', [
  { name: 'Jordan Pickford',   pos: 'GK', num: 1  },
  { name: 'Kyle Walker',       pos: 'DF', num: 2  },
  { name: 'John Stones',       pos: 'DF', num: 5  },
  { name: 'Harry Maguire',     pos: 'DF', num: 6  },
  { name: 'Luke Shaw',         pos: 'DF', num: 3  },
  { name: 'Declan Rice',       pos: 'MF', num: 4  },
  { name: 'Jude Bellingham',   pos: 'MF', num: 22 },
  { name: 'Phil Foden',        pos: 'MF', num: 11 },
  { name: 'Bukayo Saka',       pos: 'FW', num: 17 },
  { name: 'Marcus Rashford',   pos: 'FW', num: 10 },
  { name: 'Harry Kane',        pos: 'FW', num: 9  },
  { name: 'Raheem Sterling',   pos: 'FW', num: 7  },
])

const GER = mkTeam('GER', 'Alemanha', '🇩🇪', [
  { name: 'Manuel Neuer',      pos: 'GK', num: 1  },
  { name: 'Joshua Kimmich',    pos: 'DF', num: 6  },
  { name: 'Antonio Rüdiger',   pos: 'DF', num: 2  },
  { name: 'Niklas Süle',       pos: 'DF', num: 15 },
  { name: 'David Raum',        pos: 'DF', num: 3  },
  { name: 'Leon Goretzka',     pos: 'MF', num: 8  },
  { name: 'Ilkay Gündogan',    pos: 'MF', num: 21 },
  { name: 'Florian Wirtz',     pos: 'MF', num: 10 },
  { name: 'Leroy Sané',        pos: 'FW', num: 19 },
  { name: 'Kai Havertz',       pos: 'FW', num: 7  },
  { name: 'Thomas Müller',     pos: 'FW', num: 25 },
  { name: 'Serge Gnabry',      pos: 'FW', num: 11 },
])

const ESP = mkTeam('ESP', 'Espanha', '🇪🇸', [
  { name: 'Unai Simón',        pos: 'GK', num: 23 },
  { name: 'Dani Carvajal',     pos: 'DF', num: 2  },
  { name: 'Aymeric Laporte',   pos: 'DF', num: 14 },
  { name: 'Pau Torres',        pos: 'DF', num: 4  },
  { name: 'Jordi Alba',        pos: 'DF', num: 18 },
  { name: 'Sergio Busquets',   pos: 'MF', num: 5  },
  { name: 'Pedri',             pos: 'MF', num: 16 },
  { name: 'Gavi',              pos: 'MF', num: 9  },
  { name: 'Dani Olmo',         pos: 'MF', num: 8  },
  { name: 'Ferran Torres',     pos: 'FW', num: 11 },
  { name: 'Álvaro Morata',     pos: 'FW', num: 7  },
  { name: 'Marco Asensio',     pos: 'FW', num: 10 },
])

const POR = mkTeam('POR', 'Portugal', '🇵🇹', [
  { name: 'Rui Patrício',      pos: 'GK', num: 1  },
  { name: 'João Cancelo',      pos: 'DF', num: 20 },
  { name: 'Rúben Dias',        pos: 'DF', num: 4  },
  { name: 'Pepe',              pos: 'DF', num: 3  },
  { name: 'Nuno Mendes',       pos: 'DF', num: 22 },
  { name: 'Rúben Neves',       pos: 'MF', num: 8  },
  { name: 'João Moutinho',     pos: 'MF', num: 11 },
  { name: 'Bruno Fernandes',   pos: 'MF', num: 8  },
  { name: 'Bernardo Silva',    pos: 'MF', num: 10 },
  { name: 'João Félix',        pos: 'FW', num: 11 },
  { name: 'Rafael Leão',       pos: 'FW', num: 17 },
  { name: 'Cristiano Ronaldo', pos: 'FW', num: 7  },
])

const NED = mkTeam('NED', 'Holanda', '🇳🇱', [
  { name: 'Remko Pasveer',     pos: 'GK', num: 22 },
  { name: 'Denzel Dumfries',   pos: 'DF', num: 22 },
  { name: 'Virgil van Dijk',   pos: 'DF', num: 4  },
  { name: 'Nathan Aké',        pos: 'DF', num: 6  },
  { name: 'Daley Blind',       pos: 'DF', num: 17 },
  { name: 'Frenkie de Jong',   pos: 'MF', num: 21 },
  { name: 'Georginio Wijnaldum',pos: 'MF', num: 8 },
  { name: 'Teun Koopmeiners',  pos: 'MF', num: 8  },
  { name: 'Xavi Simons',       pos: 'MF', num: 7  },
  { name: 'Steven Bergwijn',   pos: 'FW', num: 7  },
  { name: 'Memphis Depay',     pos: 'FW', num: 10 },
  { name: 'Cody Gakpo',        pos: 'FW', num: 11 },
])

const URU = mkTeam('URU', 'Uruguai', '🇺🇾', [
  { name: 'Fernando Muslera',  pos: 'GK', num: 1  },
  { name: 'Nahitan Nández',    pos: 'DF', num: 3  },
  { name: 'Diego Godín',       pos: 'DF', num: 3  },
  { name: 'José María Giménez',pos: 'DF', num: 2  },
  { name: 'Mathías Olivera',   pos: 'DF', num: 17 },
  { name: 'Rodrigo Bentancur', pos: 'MF', num: 6  },
  { name: 'Lucas Torreira',    pos: 'MF', num: 5  },
  { name: 'Federico Valverde', pos: 'MF', num: 8  },
  { name: 'Giorgian de Arrascaeta',pos: 'MF', num: 10 },
  { name: 'Edinson Cavani',    pos: 'FW', num: 21 },
  { name: 'Luis Suárez',       pos: 'FW', num: 9  },
  { name: 'Darwin Núñez',      pos: 'FW', num: 11 },
])

const USA = mkTeam('USA', 'EUA', '🇺🇸', [
  { name: 'Matt Turner',       pos: 'GK', num: 1  },
  { name: 'DeAndre Yedlin',    pos: 'DF', num: 2  },
  { name: 'Walker Zimmerman',  pos: 'DF', num: 3  },
  { name: 'Miles Robinson',    pos: 'DF', num: 12 },
  { name: 'Antonee Robinson',  pos: 'DF', num: 5  },
  { name: 'Tyler Adams',       pos: 'MF', num: 4  },
  { name: 'Weston McKennie',   pos: 'MF', num: 8  },
  { name: 'Yunus Musah',       pos: 'MF', num: 6  },
  { name: 'Christian Pulisic', pos: 'FW', num: 10 },
  { name: 'Timothy Weah',      pos: 'FW', num: 11 },
  { name: 'Ricardo Pepi',      pos: 'FW', num: 9  },
  { name: 'Josh Sargent',      pos: 'FW', num: 19 },
])

export const stickers = [
  ...BRA, ...ARG, ...FRA, ...ENG, ...GER,
  ...ESP, ...POR, ...NED, ...URU, ...USA,
]

export const teams = [
  { code: 'BRA', name: 'Brasil',     flag: '🇧🇷' },
  { code: 'ARG', name: 'Argentina',  flag: '🇦🇷' },
  { code: 'FRA', name: 'França',     flag: '🇫🇷' },
  { code: 'ENG', name: 'Inglaterra', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  { code: 'GER', name: 'Alemanha',   flag: '🇩🇪' },
  { code: 'ESP', name: 'Espanha',    flag: '🇪🇸' },
  { code: 'POR', name: 'Portugal',   flag: '🇵🇹' },
  { code: 'NED', name: 'Holanda',    flag: '🇳🇱' },
  { code: 'URU', name: 'Uruguai',    flag: '🇺🇾' },
  { code: 'USA', name: 'EUA',        flag: '🇺🇸' },
]
