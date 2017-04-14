def SLAVE_LABEL="git_trigger"

node ("${SLAVE_LABEL}") {
    stage ('checkout scm') {
        checkout scm
    }

    stage ('trigger script to update release branch') {
					println "---Triggering script to update release with master"
					sh "scripts/create_release.sh patch Y9CTMV866 Y9CTMV866@nomail.relay.ibm.com"
    }
}
