import '../config/module-alias'
import { PersonController } from "@/application/controllers"

const p = new PersonController()
console.log(p.speak('Rodrigo'))
console.log(p.speak())