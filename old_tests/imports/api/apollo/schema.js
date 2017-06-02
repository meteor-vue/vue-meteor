const schema = `
type Tag {
  id: Int
  label: String
}

type Query {
  tags: [Tag]
  hello: String
  ping(message: String!): String
}

type Mutation {
  addTag(label: String!): Tag
}

schema {
  query: Query
  mutation: Mutation
}
`;

export default [schema];
