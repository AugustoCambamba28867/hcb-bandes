# Refinamento de Design — nível institucional

Sim, há espaço para melhorar. O site já tem uma base sólida (paleta verde institucional + branco, tipografia Playfair/Inter, animações), mas há inconsistências que denunciam "template" em vez de marca. Abaixo o que proponho, por ordem de impacto.

## 1. Consistência do sistema visual (maior impacto)

Hoje coexistem raios de canto muito diferentes na mesma página (`rounded-xl`, `rounded-[2rem]`, `rounded-[1.8rem]`, `rounded-full`) e três níveis de sombra improvisados (`shadow-sm`, `shadow-lg`, `shadow-2xl`, `shadow-elegant`).

- Definir uma escala fechada: um raio para cartões, um para botões/badges, um para pílulas.
- Definir 3 níveis de elevação (`card`, `raised`, `overlay`) como tokens e usar só esses.
- Padronizar espaçamento vertical das secções (ritmo único em vez de valores soltos).

## 2. Animações que reagem ao scroll

As animações de entrada disparam quando a página monta, mesmo em secções fora do ecrã — quem faz scroll chega a conteúdo já estático.

- Criar um hook de revelação por `IntersectionObserver` e aplicar aos blocos das páginas, com atraso escalonado por item.
- Reduzir a intensidade: menos deslocamento, mais opacidade — sensação premium em vez de "efeito".

## 3. Hierarquia tipográfica

Os títulos usam tamanhos ad-hoc por página.

- Escala fixa: display (hero), h2 de secção, h3 de cartão, corpo, legenda.
- Melhorar leitura: largura de linha limitada, `text-balance` nos títulos, olhais (eyebrows) com o mesmo tracking em todo o site.

## 4. Hero e provas de credibilidade

- Hero com composição mais editorial: título mais contido, subtítulo mais curto, um CTA primário claro e um secundário discreto.
- Faixa de credibilidade abaixo do hero (bancos/promotores/empresas em logótipos monocromáticos), que dá imediatamente ar corporativo.
- Números-chave com contagem animada ao entrar em vista.

## 5. Detalhes que elevam o acabamento

- Estados de foco visíveis e consistentes (acessibilidade + percepção de qualidade).
- Cabeçalho com fundo translúcido e sombra apenas após scroll.
- Uso disciplinado do dourado/accent: só em olhais e num elemento por secção.
- Página de contactos e cartões de serviço com a mesma linguagem de cartão do resto do site.
- Rodapé em três colunas com hierarquia clara e linha legal separada.

## 6. Responsividade fina

Revisão em 360px, 768px, 1024px e 1440px: tamanhos de título, grelhas que passam a 1 coluna cedo demais, e o painel admin em ecrãs pequenos.

## Notas técnicas

- Tokens de raio, elevação e escala tipográfica em `src/styles.css` (`@theme inline`), sem cores hardcoded.
- Novo `src/hooks/use-reveal.ts` (IntersectionObserver) e um componente `Reveal` em `src/components/section.tsx`.
- Aplicar em `src/routes/index.tsx`, `servicos.tsx`, `quem-somos.tsx`, `beneficios.tsx`, `diferenciais.tsx`, `modelo.tsx`, `missao-visao.tsx`, `contactos.tsx`.
- `PageHero`/`Section`/`SectionHeader` passam a impor a escala tipográfica e o ritmo vertical.
- `prefers-reduced-motion` continua respeitado.
- Sem alterações de lógica de negócio, stores ou admin (apenas o pass de responsividade).

## Fora de âmbito

Base de dados e autenticação real permanecem para depois, como combinado.
