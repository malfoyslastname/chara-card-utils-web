import React, { useMemo, useState } from 'react'
import * as Cards from 'character-card-utils'

type ActivePage =
  | 'validator'
  | 'backfiller'
  | 'backfillerWithObsolescenceNotice'
  | 'v1Updater'
  | 'examples'

const App = () => {
  const [activePage, setActivePage] = useState<ActivePage>('validator')
  return (
    <div style={{ padding: '10px', fontFamily: 'sans-serif', maxWidth: '900px', margin: 'auto' }}>
      <h1>Character card utils</h1>
      <Menu activePage={activePage} setActivePage={setActivePage} />
      <div>
        {(() => {
          switch (activePage) {
            case 'validator':
              return <Validator />
            case 'backfiller':
              return <Backfiller withObsolescenceNotice={false} />
            case 'backfillerWithObsolescenceNotice':
              return <Backfiller withObsolescenceNotice={true} />
            case 'v1Updater':
              return <V1Updater />
            case 'examples':
              return <Examples />
          }
        })()}
      </div>
    </div>
  )
}

export default App

// MAIN COMPONENTS

const Menu = ({
  activePage,
  setActivePage,
}: {
  activePage: ActivePage
  setActivePage: (val: ActivePage) => void
}) => (
  <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginBottom: '30px' }}>
    <MenuItem
      label="V2 Validator"
      onClick={() => setActivePage('validator')}
      active={activePage === 'validator'}
    />
    <MenuItem
      label="Backfill V1 fields in V2 card"
      onClick={() => setActivePage('backfiller')}
      active={activePage === 'backfiller'}
    />
    <MenuItem
      label="Backfill V1 fields in V2 card with obsolescence notice"
      onClick={() => setActivePage('backfillerWithObsolescenceNotice')}
      active={activePage === 'backfillerWithObsolescenceNotice'}
    />
    <MenuItem
      label="Update V1 card to V2"
      onClick={() => setActivePage('v1Updater')}
      active={activePage === 'v1Updater'}
    />
    <MenuItem
      label="Example valid cards"
      onClick={() => setActivePage('examples')}
      active={activePage === 'examples'}
    />
    <MenuItem
      label="Library"
      onClick={() => window.open('https://www.npmjs.com/package/character-card-utils', '_blank')}
      active={false}
    />
    <MenuItem
      label="Library docs"
      onClick={() =>
        window.open(
          'https://malfoyslastname.github.io/chara-card-utils-docs/modules.html',
          '_blank',
        )
      }
      active={false}
    />
    <MenuItem
      label="This demo's source"
      onClick={() =>
        window.open('https://github.com/malfoyslastname/chara-card-utils-web', '_blank')
      }
      active={false}
    />
  </div>
)

const Validator = () => {
  const [input, setInput] = useState('')
  const result = useMemo<V2ValidationResult>(() => parseJsonToV2Card(input), [input])
  return (
    <div>
      <h2>V2 Validator</h2>
      <RelevantLibExports
        items={[
          [
            'Cards.v2 (to parse/validate V2 cards)',
            'https://malfoyslastname.github.io/chara-card-utils-docs/variables/v2-1.html',
          ],
          [
            'Cards.parseToV2 (to parse V1 and V2 cards and automatically convert V1 cards to V2)',
            'https://malfoyslastname.github.io/chara-card-utils-docs/functions/parseToV2.html',
          ],
          [
            'Cards.safeParseToV2 (alternative which does not throw exceptions)',
            'https://malfoyslastname.github.io/chara-card-utils-docs/functions/safeParseToV2.html',
          ],
        ]}
      />
      <TextBox value={input} onChange={setInput} placeholder="Your V2 card JSON here" />
      <h3>Result</h3>
      {(() => {
        switch (result.type) {
          case 'BackfilledV2':
            return (
              <div>
                Valid V2 card, which also contains V1 fields backfilled.{' '}
                {result.inSync
                  ? 'The V1 fields are properly backfilled in a backward-compatible way.'
                  : 'CAREFUL: The backfilled V1 fields differ from the equivalent V2 fields!!!'}
              </div>
            )
          case 'V2':
            return <div>Valid V2 card.</div>
          case 'InvalidJson':
            return <InvalidJson err={result.error} />
          case 'InvalidCard':
            return <InvalidCard zodErr={result.error} />
        }
      })()}
    </div>
  )
}

const Backfiller = ({ withObsolescenceNotice }: { withObsolescenceNotice: boolean }) => {
  const [input, setInput] = useState('')
  const result = useMemo<V2ValidationResult>(() => parseJsonToV2Card(input), [input])
  return (
    <div>
      <h2>
        Backfill V1 fields in V2 card{' '}
        {withObsolescenceNotice ? 'with an obsolescence notice' : 'with their V2 equivalents'}
      </h2>
      <RelevantLibExports
        items={[
          withObsolescenceNotice
            ? [
                'Cards.backfillV2WithObsolescenceNotice',
                'https://malfoyslastname.github.io/chara-card-utils-docs/functions/backfillV2WithObsolescenceNotice.html',
              ]
            : [
                'Cards.backfillV2',
                'https://malfoyslastname.github.io/chara-card-utils-docs/functions/backfillV2.html',
              ],
        ]}
      />
      <TextBox value={input} onChange={setInput} placeholder="Your V2 card JSON here" />
      <h3>Result</h3>
      {(() => {
        switch (result.type) {
          case 'BackfilledV2':
            return (
              <div>
                {result.inSync && !withObsolescenceNotice ? (
                  <div>
                    This V2 card already has V1 fields backfilled in a backward-compatible way.
                  </div>
                ) : result.inSync && withObsolescenceNotice ? (
                  <div>
                    This V2 card had V1 fields properly backfilled already, but here is the version
                    where the fields are instead replaced with an obsolescence notice:
                    <pre>
                      value={stringify(Cards.backfillV2WithObsolescenceNotice(result.data))}
                    </pre>
                  </div>
                ) : withObsolescenceNotice ? (
                  <div>
                    Here is the V2 card you've supplied, with V1 fields backfilled with an
                    obsolescence notice:
                    <pre>{stringify(Cards.backfillV2WithObsolescenceNotice(result.data))}</pre>
                  </div>
                ) : (
                  <div>
                    Here is the V2 card you've supplied, with V1 fields backfilled with their V2
                    equivalent:
                    <pre>{stringify(Cards.backfillV2(result.data))}</pre>
                  </div>
                )}
              </div>
            )
          case 'V2':
            return (
              <div>
                Here is the card you provided with V1 fields backfilled
                {withObsolescenceNotice
                  ? 'with an obsolescence notice'
                  : 'with their equivalent V2 field'}
                :
                <pre>
                  {stringify(
                    withObsolescenceNotice
                      ? Cards.backfillV2WithObsolescenceNotice(result.data)
                      : Cards.backfillV2(result.data),
                  )}
                </pre>
              </div>
            )
          case 'InvalidJson':
            return <InvalidJson err={result.error} />
          case 'InvalidCard':
            return <InvalidCard zodErr={result.error} />
        }
      })()}
    </div>
  )
}

const V1Updater = () => {
  const [input, setInput] = useState('')
  const result = useMemo<V1ValidationResult>(() => parseJsonToV1Card(input), [input])
  return (
    <div>
      <h2>Update V1 card to V2</h2>
      <RelevantLibExports
        items={[
          [
            'Cards.v1toV2',
            'https://malfoyslastname.github.io/chara-card-utils-docs/functions/v1ToV2.html',
          ],
        ]}
      />
      <TextBox value={input} onChange={setInput} placeholder="Your V1 card JSON here" />
      <h3>Result</h3>
      {(() => {
        switch (result.type) {
          case 'BackfilledV2':
            return (
              <div>The card you've provided is already a V2 card (with V1 fields backfilled).</div>
            )
          case 'V2':
            return <div>The card you've provided is already a V2 card.</div>
          case 'V1':
            return (
              <div>
                Here's the card you've provided, upgraded to V2 format with sensible defaults:
                <pre>{stringify(Cards.v1ToV2(result.data))}</pre>
              </div>
            )
          case 'InvalidJson':
            console.log(result)
            return <InvalidJson err={result.error} />
          case 'InvalidCard':
            return <InvalidCard zodErr={result.error} />
        }
      })()}
    </div>
  )
}

const Examples = () => {
  const v1Card: Cards.V1 = {
    name: 'Sui the card test',
    first_mes: "Hi! I'm Sui.",
    scenario: 'Sui tells a nice story',
    description: '{{char}} is very happy.',
    personality: '',
    mes_example: "{{user}}: You're cool.\n{{char}}: Thanks!",
  }
  const v2CardNoCharacterBook: Cards.V2 = {
    spec: 'chara_card_v2',
    spec_version: '2.0',
    data: {
      ...v1Card,
      creator_notes: 'Sui is nice',
      system_prompt: "Enter roleplay mode. Write {{char}}'s next reply.",
      post_history_instructions: 'Your reply must end with "desu".',
      alternate_greetings: ["Hey, what's up?", 'Hey there.'],
      tags: ['female', 'nice'],
      creator: 'malfoy',
      character_version: '1',
      extensions: {},
    },
  }
  const v2Card: Cards.V2 = {
    ...v2CardNoCharacterBook,
    data: {
      ...v2CardNoCharacterBook.data,
      character_book: {
        name: 'the dummy book',
        description: 'dummy book',
        entries: [
          {
            keys: ['dummy'],
            content: 'this is a dummy entry',
            extensions: {},
            enabled: false,
            insertion_order: 0,
            name: 'dummy',
            priority: 0,
          },
        ],
        extensions: {},
      },
    },
  }
  return (
    <div>
      <h2>Example valid cards</h2>
      <h3>Valid V1 card</h3>
      <pre>{stringify(v1Card)}</pre>
      <h3>Valid V2 card</h3>
      <pre>{stringify(v2Card)}</pre>
      <h3>Valid V2 card without character book</h3>
      <pre>{stringify(v2CardNoCharacterBook)}</pre>
      <h3>Valid V2 card with V1 fields backfilled</h3>
      <pre>{stringify(Cards.backfillV2(v2CardNoCharacterBook))}</pre>
      <h3>Valid V2 card with V1 fields backfilled with obsolescence notice</h3>
      <pre>{stringify(Cards.backfillV2WithObsolescenceNotice(v2CardNoCharacterBook))}</pre>
      <h3>Valid V2 card with arbitrary data inside the extensions field</h3>
      <pre>
        {stringify({
          ...v2CardNoCharacterBook,
          data: {
            ...v2CardNoCharacterBook.data,
            extensions: {
              agnai: {
                authorNote: 'Your message must have a happy tone.',
              },
            },
          },
        })}
      </pre>
    </div>
  )
}

// HELPER COMPONENTS

const MenuItem = (props: { onClick: () => void; label: string; active: boolean }) => (
  <div
    onClick={props.onClick}
    style={{
      display: 'inline-block',
      background: props.active ? '#BEE9C2' : '#D5E4D6',
      borderRadius: '5px',
      padding: '5px 15px',
      cursor: 'pointer',
    }}
  >
    {props.label}
  </div>
)

const RelevantLibExports = ({ items }: { items: [string, string][] }) => (
  <div>
    Relevant library exports:
    <ul>
      {items.map(([label, link], i) => (
        <li key={i}>
          <a href={link}>{label}</a>
        </li>
      ))}
    </ul>
  </div>
)

const TextBox = (props: {
  value: string
  placeholder?: string
  onChange?: (s: string) => void
  autoHeight?: boolean
}) => (
  <textarea
    style={{
      width: 'calc(100% - 50px)',
      height: props.autoHeight ? 'auto' : '300px',
      margin: '10px 0',
    }}
    value={props.value}
    placeholder={props.placeholder}
    onChange={(ev) => props.onChange?.(ev.target.value)}
  />
)

const InvalidJson = ({ err }: any) => (
  <div>
    Invalid JSON provided:
    <pre>{err.toString()}</pre>
  </div>
)

const InvalidCard = (zodErr: any) => (
  <div>
    Valid JSON, but invalid card with the following error:
    <pre>{stringify(zodErr)}</pre>
  </div>
)

// HELPER FUNCTIONS

const areV1FieldsInSyncWithV2Fields = (card: Cards.BackfilledV2): boolean =>
  card.name === card.data.name &&
  card.description === card.data.description &&
  card.personality === card.data.personality &&
  card.scenario === card.data.scenario &&
  card.first_mes === card.data.first_mes &&
  card.mes_example === card.data.mes_example

type V2ValidationResult =
  | { type: 'V2'; data: Cards.V2 }
  | { type: 'BackfilledV2'; inSync: boolean; data: Cards.BackfilledV2 }
  | { type: 'InvalidCard'; error: any }
  | { type: 'InvalidJson'; error: any }

const parseJsonToV2Card = (input: string): V2ValidationResult => {
  try {
    const inputAsJson = JSON.parse(input)
    const v2WithBackfill = Cards.v1.merge(Cards.v2).safeParse(inputAsJson)
    if (v2WithBackfill.success)
      return {
        type: 'BackfilledV2',
        inSync: areV1FieldsInSyncWithV2Fields(inputAsJson),
        data: v2WithBackfill.data,
      }
    const v2 = Cards.v2.safeParse(inputAsJson)
    if (v2.success) return { type: 'V2', data: v2.data }
    return { type: 'InvalidCard', error: v2.error }
  } catch (error) {
    return { type: 'InvalidJson' as const, error }
  }
}

type V1ValidationResult =
  | { type: 'V1'; data: Cards.V1 }
  | { type: 'BackfilledV2' }
  | { type: 'V2' }
  | { type: 'InvalidCard'; error: any }
  | { type: 'InvalidJson'; error: any }

const parseJsonToV1Card = (input: string): V1ValidationResult => {
  try {
    const inputAsJson = JSON.parse(input)
    const v2WithBackfill = Cards.v1.merge(Cards.v2).safeParse(inputAsJson)
    if (v2WithBackfill.success) return { type: 'BackfilledV2' }
    const v2 = Cards.v2.safeParse(inputAsJson)
    if (v2.success) return { type: 'V2' }
    const v1 = Cards.v1.safeParse(inputAsJson)
    if (v1.success) return { type: 'V1', data: v1.data }
    return { type: 'InvalidCard', error: v2.error }
  } catch (error) {
    return { type: 'InvalidJson' as const, error }
  }
}

const stringify = (json: any): string => JSON.stringify(json, null, 2)
