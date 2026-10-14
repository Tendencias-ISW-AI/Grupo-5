# Data Model — SMARLIST-14 / HU-13

products existente,id PK:string,name:string,quantity:number,purchased:boolean. Sin columnas o estados nuevos. Eliminación física registro→ausencia,sin alterar productos restantes.

IdentificadorDELETE:UUIDhex8-4-4-4-12,no normalizado,sin versión específica. Compartir validación básicastring deHU12 y añadir formato soloal nuevoendpoint. PUTstring histórico intacto. Nombres duplicados no participan en identificación;ambos estados eliminables.

Repositorio devuelveconteo0/1;no devuelve producto o atributos en éxitoHTTP204.0→404. MySQL confirmaeliminación quepersiste trasreinicio;no recuperación,borrado lógico o modelonuevo.
