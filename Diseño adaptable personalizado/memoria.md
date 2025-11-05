# Memoria de estilos (versión simple)

## 1) Unidades de medida
- Se usan `px`, `%` y valores fluidos (`clamp` en el título).
- Contenedor principal: `max-width: 980px` y `padding: 0 16px`.

## 2) Menú horizontal tradicional
- `nav li{ display:inline-block }` y `nav ul{ font-size:0 }` para eliminar el espacio fantasma entre inline-block.
- Enlace activo: `a[aria-current="page"]` con fondo y texto blanco.
- Estados `:hover` y `:active` en enlaces/botón.

## 3) Modelo de cajas
- `.card` y `.panel` aplican `border`, `padding`, `margin`, `border-radius` y `box-sizing: border-box`.
- `figure` con `aspect-ratio:16/9` para estabilizar la caja de imagen.

## 4) Display
- Tarjetas en rejilla simple usando **`display:inline-block`** (no grid/flex) con `width:32%` y márgenes.
- `font-size:0` en `.cards` para resolver el **espacio entre inline-block**.

## 5) Posicionamiento
- `header` con `position: sticky`.
- `.badge` y `.pin` con `position:absolute` dentro de contenedores `position:relative`.
- Botón “Arriba” con `position:fixed`.

## 6) Overflow
- `.panel.scroll{ max-height:90px; overflow:auto }` para crear scroll interno.

## 7) Flotantes
- En `.floatbox` la imagen usa `float:left` y la nota `float:right`.
- **Clearfix**: `.floatbox::after{ content:""; display:block; clear:both }` para evitar colapso del contenedor.

## 8) Pseudo-clases y pseudo-elementos
- `:hover`, `:active`, `:focus` en enlaces y botones.
- `h2::after` y `::selection` como pseudo-elementos.
- `a[aria-current="page"]` (atributo/pseudo-clase de estado).

## 9) Adaptabilidad
- Media queries:
  - `max-width:860px` → cards al 48% y se desactiva el float derecho.
  - `max-width:560px` → cards al 100% e imagen flotante pasa a bloque.

## 10) Notas de problemas y soluciones
- **Espacio inline-block**: se eliminó con `font-size:0` en el contenedor.
- **Flotantes**: se aplicó clearfix con `::after` para cerrar el flujo.
