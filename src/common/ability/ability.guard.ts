import { ForbiddenError } from "@casl/ability";
import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { CHECK_ABILITY, RequiredRule } from "./ability.decorator";
import { AbilityFactory } from "./ability.factory";

@Injectable()
export class AbilitiesGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        private caslAbilityFactior: AbilityFactory
    ) { }
    async canActivate(context: ExecutionContext): Promise<boolean> {
        console.log(this.reflector);

        const rules = this.reflector.get<RequiredRule[]>(CHECK_ABILITY, context.getHandler()) || [];

        const { user } = context.switchToHttp().getRequest();
        debugger
        const ability = this.caslAbilityFactior.defineAbility(user);

        try {
            rules.forEach((rule) =>
                ForbiddenError.from(ability).throwUnlessCan(rule.action, rule.subject)
            )
            return true
        } catch (error) {
            if (error instanceof ForbiddenError) {
                throw new ForbiddenException(error.message);
            }
        }
    }
}