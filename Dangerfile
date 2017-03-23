fail "Please add labels to this PR" if github.pr_labels.empty?

# Make it more obvious that a PR is a work in progress and shouldn't be merged yet
if github.pr_labels.include?('work in progress') or git.commits.any?{|c| c.message.include?('WIP') }
  warn("PR is a Work in Progress")
end

fail "Please provide a summary in the Pull Request description" if github.pr_body.length < 5

warn("Has not passed code-review") unless github.pr_labels.include?('review passed')
warn("Has not passed QA") unless github.pr_labels.include?('QA passed')

warn "PR base is not set to master!" if github.branch_for_base != "master"

# Warn when there is a big PR
warn("Big PR") if git.lines_of_code > 500

if git.commits.any? { |c| c.message =~ /^Merge branch 'master'/ }
  fail 'Please rebase to removed merge commits in this PR'
end

# Don't let testing shortcuts get into master by accident
fail("fdescribe left in tests") if `grep -r fdescribe spec/ `.length > 1
fail("fit left in tests") if `grep -r fit spec/ `.length > 1

if git.commits.any? {|c| c.message =~ /(fixup|squash)!/ }
  fail 'Contains a fixup or squash commit'
end

git.commits.each do |c|
  short = " ( #{c.sha[0..7]} )"
  has_migrations = c.diff_parent.any? {|f| f.path =~ /db\/migrate\// }
  has_schema_changes = c.diff_parent.any? {|f| f.path =~ /db\/schema\.rb/ }
  has_migration_msg = c.message =~ /^\[migration\]/
  if has_migrations || has_schema_changes
    unless has_migration_msg
      fail '[migration] Schema migration commits need to be prefixed with [migration]' + short
    end
    if (has_migrations && !has_schema_changes) || (!has_migrations & has_schema_changes)
      fail '[migration] Please checkin your schema.rb changes with your migration' + short
    end
    if c.diff_parent.any? {|f| !( f.path =~ /db\/migrate\// or f.path =~ /db\/schema.rb/ ) } 
      fail '[migration] Migration commit contains non-migration changes' + short
    end
  elsif has_migration_msg
    fail '[migration] Migration commit with no migrations!' + short
  end

  has_gemfile_changes = c.diff_parent.any? {|f| f.path =~ /Gemfile/ }
  has_gemfile_msg = c.message =~ /^\[gemfile\]/
  if has_gemfile_changes
    unless has_gemfile_msg
      fail '[gemfile] Gemfile commits need to be prefixed with [gemfile] ' + short
    end
    if c.diff_parent.any? {|f| !( f.path =~ /Gemfile/ ) }
      fail '[gemfile] Gemfile commit contains non-gemfile changes' + short
    end
  elsif has_gemfile_msg
    fail '[gemfile] Gemfile commit has no gemfile changes!' + short
  end
end

username = ENV['CIRCLE_PROJECT_USERNAME']
project_name = ENV['CIRCLE_PROJECT_REPONAME']
build_number = ENV['CIRCLE_BUILD_NUM']
if username && project_name && build_number
  # submit message giving the coverage report that was generated by simplecov
  message('[html coverage report](https://circleci.com/api/v1/project/'+username+'/'+project_name+'/'+build_number+'/artifacts/0/$CIRCLE_ARTIFACTS/coverage/index.html)')
end
