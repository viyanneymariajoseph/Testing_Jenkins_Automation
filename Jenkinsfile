pipeline {
    agent any

    stages {
        stage('Git-Checkout') {
    steps {
        echo 'Checking out from Git Repo'
        git url: 'https://github.com/viyanneymariajoseph/Testing_Jenkins_Automation.git', branch: 'main'
    }
}


        stage('Build') {
            steps {
                echo "Building the checked-out project!"
                bat 'Build.bat'
            }
        }

        // stage('Unit-Test') {
        //     steps {
        //         echo "Running JUnit Tests"
        //         bat 'Unit.bat'
        //     }
        // }

        stage('Quality-Gate') {
            steps {
                echo "Verifying Quality Gates"
                bat 'Quality.bat'
            }
        }

        stage('Deploy') {
            steps {
                echo "Deploying to local IIS"
                bat 'Deploy.bat'
            }
        }
    }

    post {
        success {
            echo '✅ Build and Deploy completed successfully!'
        }
        failure {
            echo '❌ Build failed. Please check logs.'
        }
    }
}
