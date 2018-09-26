const { ApolloServer, gql } = require('apollo-server');

let recordings = [
    {
        id: 1,
        title: 'Recording 1 graphql example',
        input: [ {midiNumber: 51, currentTime: 1}, {midiNumber: 52, currentTime: 2}, {midiNumber: 53, currentTime: 3}],
    }
];

const typeDefs = gql`
    type Recordings {
        id: ID!
        recordings: [Recording]
    }
    input RecordingsInput {
        recordings: [RecordingInput]
    }
    type Recording {
        id: ID!
        title: String!
        input: [AudioInput!]
    }
    input RecordingInput {
        title: String!
        input: [AudioInputInput!]
    }
    type AudioInput {
      midiNumber: Float!
      currentTime: Float!

    }
    input AudioInputInput {
      midiNumber: Float!
      currentTime: Float!
    }

    type Query {
        recordings: [Recording!]
    }

    type Mutation {
        addRecording(title: String!, input: [AudioInputInput!]): Recording
        updateRecordings(recordings: RecordingsInput): Recordings
    }
`

const resolvers = {
    Query: {
        recordings: () => recordings,
    },
    Mutation: {
        addRecording: (_, { title, input }) => {
            const newRecording = {
                id: recordings.length + 1,
                title: title,
                input: input,
            };
            recordings.push(newRecording);

            return newRecording;
        },
        updateRecordings: (_, { recordings }) => {
          console.log("===updateRecording", recordings)

          // const index = recordings.findIndex(graphqlRecording => graphqlRecording.input === input)
          // const id = recordings.find(graphqlRecording => graphqlRecording.input === input).id
          // const recording = {id, title, input}
          recordings = recordings
          return recordings;
        }
    }
}

const server = new ApolloServer({ typeDefs, resolvers });

server.listen().then(({ url }) => {
    console.log(`Apollo server running: ${url}`);
});
