/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule InlineFragmentsTransform
 * @flow
 * @format
 */

'use strict';

const GraphQLCompilerContext = require('../core/GraphQLCompilerContext');
const GraphQLIRTransformer = require('../core/GraphQLIRTransformer');

const invariant = require('invariant');

import type {InlineFragment, Fragment, FragmentSpread} from '../core/GraphQLIR';

type State = {};
const STATE = {};

/**
 * A transform that inlines all fragments and removes them.
 */
function inlineFragmentsTransform(
  context: GraphQLCompilerContext,
): GraphQLCompilerContext {
  return GraphQLIRTransformer.transform(
    context,
    {
      Fragment: visitFragment,
      FragmentSpread: visitFragmentSpread,
    },
    () => STATE,
  );
}

function visitFragment(fragment: Fragment, state: State): ?Fragment {
  return null;
}

function visitFragmentSpread(
  fragmentSpread: FragmentSpread,
  state: State,
): FragmentSpread {
  invariant(
    fragmentSpread.args.length === 0,
    'InlineFragmentsTransform: Cannot flatten fragment spread `%s` with ' +
      'arguments. Use the `ApplyFragmentArgumentTransform` before flattening',
    fragmentSpread.name,
  );
  const fragment = this.getContext().get(fragmentSpread.name);
  invariant(
    fragment && fragment.kind === 'Fragment',
    'InlineFragmentsTransform: Unknown fragment `%s`.',
    fragmentSpread.name,
  );
  const result: InlineFragment = {
    kind: 'InlineFragment',
    directives: fragmentSpread.directives,
    metadata: fragmentSpread.metadata,
    selections: fragment.selections,
    typeCondition: fragment.type,
  };

  return this.traverse(result, state);
}

module.exports = {
  transform: inlineFragmentsTransform,
};
