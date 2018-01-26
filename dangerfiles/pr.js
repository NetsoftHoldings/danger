import {danger, warn, fail, message} from "danger"

if( ! danger.github.issue.labels.length ) {
    fail('Please add labels to this PR')
}

// Make it more obvious that a PR is a work in progress and shouldn't be merged yet
if( danger.github.issue.labels.includes('work in progress') || danger.git.commits.find( c => c && c.message.includes('WIP') ) ) {
    warn("PR is a Work in Progress")
}

if( danger.github.pr.body.length < 5 ) {
    fail( "Please provide a summary in the Pull Request description")
}

if( ! danger.github.issue.labels.includes('review passed') ) {
    warn("Has not passed code-review")
}

if( ! danger.github.issue.labels.includes('QA passed') ) {
    warn("Has not passed QA")
}

if( ! danger.github.pr.base.ref.includes('master') ) {
    warn("PR base is not set to master!")
}

// Warn when there is a big PR
if ( 500 < (danger.github.pr.additions + danger.github.pr.deletions) ) {
  warn(':exclamation: Big PR')
}

if( danger.git.commits.find( c => c && c.message.match(/(fixup|squash)!/) ) ) {
  warn("Contains a fixup or squash commit")
}

