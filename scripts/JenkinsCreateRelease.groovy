def SLAVE_LABEL="git_trigger"

node ("${SLAVE_LABEL}") {
    stage ('checkout scm') {
        checkout scm
    }

    stage ('trigger create release script') {
					println "---Triggering script to update release with master"
					sh "scripts/create_release.sh patch"
    }
}
