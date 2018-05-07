# Don't let testing shortcuts get into master by accident
if Dir.exists?('spec')
  fail("fdescribe left in tests") if `grep -r -e '\\bfdescribe\\b' spec/ |grep -v 'danger ok' `.length > 1
  fail("fcontext left in tests") if `grep -r -e '\\bfcontext\\b' spec/ |grep -v 'danger ok' `.length > 1
  fail("fit left in tests") if `grep -r -e '\\bfit\\b' spec/ | grep -v 'danger ok' `.length > 1
  fail("ap left in tests") if `grep -r -e '\\bap\\b' spec/ | grep -v 'danger ok' `.length > 1
  fail("puts left in tests") if `grep -r -e '\\bputs\\b' spec/ | grep -v 'danger ok' `.length > 1
end

git.commits.each do |c|
  short = " ( #{c.sha[0..7]} )"
  has_migrations = c.diff_parent.any? {|f| f.path =~ /db\/migrate\// }
  has_schema_changes = c.diff_parent.any? {|f| f.path =~ /db\/schema\.rb/ }
  has_migration_msg = c.message =~ /^\[migration\]/
  no_schema_ok = ENV['DANGER_NO_SCHEMA_OK'] || false
  if has_migrations || has_schema_changes
    unless has_migration_msg
      fail '[migration] Schema migration commits need to be prefixed with [migration]' + short
    end
    if has_migrations && !has_schema_changes && !no_schema_ok
      fail '[migration] Please checkin your schema.rb changes with your migration' + short
    end
    if !has_migrations && has_schema_changes
      warn '[migration] Please checkin your migrations with your schema.rb changes' + short
    end
    if c.diff_parent.any? {|f| !( f.path =~ /db\/migrate\// or f.path =~ /db\/schema.rb/ ) }
      fail '[migration] Migration commit contains non-migration changes' + short
    end
  elsif has_migration_msg
    fail '[migration] Migration commit with no migrations!' + short
  end

  has_hubstaff_icon_changes = c.diff_parent.any? {|f| f.path =~ /hubstaff(icons|font)/ || f.path =~ /fontcustom-manifest/ }
  if has_hubstaff_icon_changes
    if c.diff_parent.any? {|f| !( f.path =~ /hubstaff-(icons|font)/ || f.path =~ /fontcustom-manifest/ ) }
      fail '[hubstaff-icons] Put hubstaff-icon changes into their own commit' + short
    end
  end

  has_gemfile_changes = c.diff_parent.any? {|f| f.path =~ /Gemfile/ || f.path =~ /gemspec/ }
  has_gemfile_msg = c.message =~ /^\[gemfile\]/
  if has_gemfile_changes
    unless has_gemfile_msg
      fail '[gemfile] Gemfile commits need to be prefixed with [gemfile] ' + short
    end
    if c.diff_parent.any? {|f| !( f.path =~ /Gemfile/ || f.path =~ /gemspec/ ) }
      fail '[gemfile] Gemfile commit contains non-gemfile changes' + short
    end
    if c.diff_parent.any? {|f| f.path == 'Gemfile.lock' }
      unless `grep -e '^   1.15.2$' Gemfile.lock`.length > 1
        fail("[gemfile] Gemfile not bundled with bundler 1.15.2")
      end
    end
  elsif has_gemfile_msg
    fail '[gemfile] Gemfile commit has no gemfile changes!' + short
  end
end

if ENV['CIRCLE_VERSION'] == '2.0'
  require 'open-uri'

  artifact_url = "https://circleci.com/api/v1.1/project/github/#{ENV['CIRCLE_PROJECT_USERNAME']}/#{ENV["CIRCLE_PROJECT_REPONAME"]}/#{ENV['CIRCLE_BUILD_NUM']}/artifacts?circle-token=#{ENV['CIRCLE_TOKEN']}"
  artifacts = JSON.load(open(artifact_url).read).map{|a| a["url"]}

  jest = artifacts.find{ |artifact| artifact.end_with?('jest/index.html') }
  coverage = artifacts.find{ |artifact| artifact.end_with?('coverage/index.html') }
  rspec_files = artifacts.select{ |artifact| artifact =~ /rspec-(\d+)\.html$/ }
  teaspoon = artifacts.find{ |artifact| artifact.end_with?('teaspoon.html') }

  {}.tap do |hash|
    hash['Ruby coverage report'] = coverage if coverage
    hash['RSpec test report'] = rspec_files unless rspec_files.empty?
    hash['Jest coverage report'] = jest if jest
    hash['Teaspoon test report'] = jest if teaspoon
  end.each do |msg, links|
    links = [*links]
    if links.size == 1
      message("[#{msg}](#{links[0]})")
    else
      message("#{msg} - #{links.map{|l| "[link](#{l})"}.join(', ')}")
    end
  end
else
  username = ENV['CIRCLE_PROJECT_USERNAME']
  project_name = ENV['CIRCLE_PROJECT_REPONAME']
  build_number = ENV['CIRCLE_BUILD_NUM']
  if username && project_name && build_number
    # submit message giving the coverage report that was generated by simplecov
    message('[Ruby coverage report](https://circleci.com/api/v1/project/'+username+'/'+project_name+'/'+build_number+'/artifacts/0/$CIRCLE_ARTIFACTS/coverage/index.html)')
  end
end
