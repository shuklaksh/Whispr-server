export interface JWTUser {
    id: string
    email: string,
    firstName: string,
    lastName: string
}

export interface GraphQLContext {
    user?: JWTUser
}
